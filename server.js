import { equipmentConfig, getEquipmentProperties } from './config/equipmentsConfig.js';
import express from 'express';
import cors from 'cors';

const app = express();

function isActiveNode(node) {
  const equipment = getEquipmentProperties(node.data?.params?.['Type équipement'] || node.type || '');
  return equipment?.isActive || false;
}

function isPassiveNode(node) {
  const equipment = getEquipmentProperties(node.data?.params?.['Type équipement'] || node.type || '');
  return equipment?.isPassive || false;
}

function isRegenerativeNode(node) {
  const equipment = getEquipmentProperties(node.data?.params?.['Type équipement'] || node.type || '');
  return equipment?.isRegenerative || false;
}

// NOUVELLE FONCTION 1: Calcul de la numérologie 5G
function calculate5GNumerology(frequency, bandwidth, numerologyMu = 1) {
  // Numerology en 5G NR : μ = 0,1,2,3,4 avec SCS = 15,30,60,120,240 kHz
  const subcarrierSpacings = {
    0: 15,   // 15 kHz
    1: 30,   // 30 kHz  
    2: 60,   // 60 kHz
    3: 120,  // 120 kHz
    4: 240   // 240 kHz
  };
  
  const scs = subcarrierSpacings[numerologyMu] || 30;
  const numberOfSubcarriers = (bandwidth * 1000) / scs; // Conversion MHz vers kHz
  const slotDuration = 1 / (2 ** numerologyMu); // en ms
  
  return {
    subcarrierSpacing: scs,
    numberOfSubcarriers: Math.floor(numberOfSubcarriers),
    slotDuration: slotDuration,
    numerology: numerologyMu
  };
}

// NOUVELLE FONCTION 2: Efficacité spectrale selon la modulation
function getSpectralEfficiency(linkType, modulation, codeRate = 1) {
  const modulationEfficiency = {
    'QPSK': 2,
    '16QAM': 4,
    '64QAM': 6,
    '256QAM': 8,
    '1024QAM': 10
  };
  
  const baseEfficiency = modulationEfficiency[modulation] || 2;
  
  // Efficacité spectrale typique par technologie
  const technologyFactor = {
    'GSM': 0.5,
    'UMTS': 0.5,
    '4G': 3,
    '5G': 6
  };
  
  return baseEfficiency * codeRate * (technologyFactor[linkType] || 1);
}

function buildTopologyGraph(nodes, edges) {
  const graph = new Map();
  
  nodes.forEach(node => {
    graph.set(node.id, { node, connections: [] });
  });
  
  edges.forEach(edge => {
    if (graph.has(edge.source) && graph.has(edge.target)) {
      graph.get(edge.source).connections.push({ target: edge.target, edge });
      graph.get(edge.target).connections.push({ target: edge.source, edge, reverse: true });
    }
  });
  
  return graph;
}

function findChainPath(graph, sourceId, targetId) {
  const visited = new Set();
  const path = [];
  
  function dfs(nodeId, targetId, currentPath) {
    if (nodeId === targetId) {
      return [...currentPath];
    }
    
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);
    
    const nodeData = graph.get(nodeId);
    if (!nodeData) return null;
    
    for (const connection of nodeData.connections) {
      if (!visited.has(connection.target)) {
        const result = dfs(connection.target, targetId, [...currentPath, connection]);
        if (result) return result;
      }
    }
    
    visited.delete(nodeId);
    return null;
  }
  
  return dfs(sourceId, targetId, []);
}

app.use(cors());
app.use(express.json());

// FONCTION MISE À JOUR: calculateDirectLinkBudget avec améliorations 5G
const calculateDirectLinkBudget = (sourceNode, targetNode, edge) => {
  try {
    const txNode = sourceNode;
    const rxNode = targetNode;
    
    console.log(`Liaison directe: ${txNode.data.label} (émetteur) → ${rxNode.data.label} (récepteur)`);

    const power = parseFloat(txNode.data.params['Puissance (dBm)'] || 20);
    const distance = parseFloat(edge.data?.params?.['Portée (km)'] || 0.1);
    const linkType = edge.data?.params?.['Type liaison'] || 'Hertzien';
    
    let loss = 0, capacity = 0, coverage = 0, latency = 0, snr_dB = 0, bitrate = 0, margin = 0;
    let frequenciesPerCell, reuseDistance, cellularCapacity;
    
    // Calcul du débit binaire (pour tous les types)
    const modulationRate = parseFloat(edge.data?.params?.['Rapidité modulation (bauds)'] || 1200);
    const valence = parseFloat(edge.data?.params?.['Valence'] || 16);
    bitrate = modulationRate * Math.log2(valence);
      
    if (linkType === 'Optique') {
      // Paramètres optiques améliorés
      const attenuation = parseFloat(edge.data?.params?.['Atténuation (dB/km)'] || 0.2);
      const connectorLoss = parseFloat(edge.data?.params?.['Perte connecteurs (dB)'] || 0.4);
      const spliceLoss = parseFloat(edge.data?.params?.['Perte épissures (dB)'] || 0.1);
      const wavelength = parseFloat(edge.data?.params?.['Longueur d\'onde (nm)'] || 1550);
      const numericalAperture = parseFloat(edge.data?.params?.['Ouverture numérique'] || 0.1);
      
      loss = attenuation * distance + connectorLoss + spliceLoss;
      latency = (distance * 1000) / (2e8) * 1e3; // Vitesse lumière dans fibre ≈ 2×10^8 m/s
      coverage = 20 / attenuation; // Portée typique
      
      const sensitivity = parseFloat(edge.data?.params?.['Sensibilité récepteur (dBm)'] || -30);
      margin = (power - loss) - sensitivity;
      
      // Capacité basée sur la bande passante optique
      const opticalBandwidth = 1000; // MHz typique pour fibre
      capacity = opticalBandwidth * 8; // Approximation pour fibre optique
      
    } else if (linkType === 'RJ45') {
      // Paramètres RJ45 améliorés
      const category = edge.data?.params?.['Catégorie'] || 'Cat6';
      const impedance = parseFloat(edge.data?.params?.['Impédance caractéristique (Ω)'] || 100);
      const attenuationPer100m = parseFloat(edge.data?.params?.['Atténuation (dB/100m)'] || 19.8);
      const maxFrequency = parseFloat(edge.data?.params?.['Fréquence maximale (MHz)'] || 250);
      const nominalRate = parseFloat(edge.data?.params?.['Débit nominal (Mbps)'] || 1000);
      
      // Conversion km vers m pour RJ45
      const distanceM = distance * 1000;
      if (distanceM > 100) {
        console.warn(`Distance ${distanceM}m dépasse la limite RJ45 de 100m`);
      }
      
      loss = (attenuationPer100m * distanceM) / 100;
      latency = distanceM * 5e-9 * 1000; // 5ns/m en ms
      coverage = 0.1; // 100m maximum
      capacity = nominalRate;
      
    } else if (['GSM', 'UMTS', '4G', '5G'].includes(linkType)) {
      // Paramètres communs radio
      const frequency = parseFloat(txNode.data.params['Fréquence (MHz)'] || 
        (linkType === 'GSM' ? 900 : linkType === 'UMTS' ? 2100 : 
         linkType === '4G' ? 2600 : 3500));
      
      // Calcul des gains d'antenne mis à jour
      const antennaGainTx = parseFloat(txNode.data.params['Gain antenne (dBi)'] || 15);
      const antennaGainRx = parseFloat(rxNode.data.params['Gain antenne (dBi)'] || 15);
      const cableLoss = parseFloat(edge.data?.params?.['Perte câble (dB)'] || 2);
              
      // Calcul de perte en espace libre
      const freeSpaceLoss = 32.4 + 20 * Math.log10(distance) + 20 * Math.log10(frequency / 1000);
      loss = freeSpaceLoss + cableLoss - antennaGainTx - antennaGainRx;
      
      // Calcul de la couverture
      coverage = Math.pow(10, (100 - 32.4 - 20 * Math.log10(frequency / 1000)) / 20);
      
      // Paramètres spécifiques par technologie
      if (linkType === 'GSM') {
        latency = 300;
        const totalFrequencies = parseFloat(edge.data?.params?.['Total fréquences'] || 15);
        const cellRadius = parseFloat(edge.data?.params?.['Rayon cellule (km)'] || 1);
        const i = parseFloat(edge.data?.params?.['i'] || 2);
        const j = parseFloat(edge.data?.params?.['j'] || 1);
        const clusterSize = Math.pow(i, 2) + Math.pow(j, 2) + i * j;
        
        frequenciesPerCell = totalFrequencies / clusterSize;
        reuseDistance = cellRadius * Math.sqrt(3 * clusterSize);
        
        const totalArea = parseFloat(edge.data?.params?.['Surface totale (km²)'] || 1000);
        const cellArea = Math.PI * Math.pow(cellRadius, 2);
        // GSM : accumulation correcte car fréquences différentes par cluster
        cellularCapacity = (totalArea / cellArea) * frequenciesPerCell * 0.2; // 200 kHz par canal
        
      } else if (linkType === 'UMTS') {
        latency = 100;
        const bandwidth = parseFloat(edge.data?.params?.['Bande passante (MHz)'] || 5);
        const spreadingFactor = parseFloat(edge.data?.params?.['Facteur d\'étalement (SF)'] || 128);
        const cellRadius = parseFloat(edge.data?.params?.['Portée (km)'] || 2);
        const totalArea = parseFloat(edge.data?.params?.['Surface totale (km²)'] || 1000);
        const cellArea = Math.PI * Math.pow(cellRadius, 2);
        const numberOfCells = totalArea / cellArea;
        
        // UMTS : capacité par cellule limitée par interférences
        const chipRate = 3.84e6; // 3.84 Mcps
        const maxUsersPerCell = chipRate / (bitrate * spreadingFactor);
        
        // Facteur de charge UMTS (dégradation avec nombre d'utilisateurs)
        const loadFactor = Math.min(0.8, 1 / (1 + numberOfCells * 0.05)); // Dégradation inter-cellulaire
        
        cellularCapacity = numberOfCells * maxUsersPerCell * (bitrate / 1e6) * loadFactor;
        reuseDistance = cellRadius * Math.sqrt(3);
        
      } else if (linkType === '4G') {
        latency = 50;
        const bandwidth = parseFloat(edge.data?.params?.['Bande passante (MHz)'] || 20);
        const mimoLayers = parseFloat(edge.data?.params?.['Couches MIMO'] || 2);
        const modulation = edge.data?.params?.['Modulation (QPSK/16QAM/64QAM/256QAM)'] || '64QAM';
        const codeRate = parseFloat(edge.data?.params?.['Code rate'] || 0.75);
        const cellRadius = parseFloat(edge.data?.params?.['Portée (km)'] || 1);
        const totalArea = parseFloat(edge.data?.params?.['Surface totale (km²)'] || 1000);
        
        const spectralEfficiency = getSpectralEfficiency('4G', modulation, codeRate);
        const theoreticalCapacityPerCell = bandwidth * mimoLayers * spectralEfficiency;
        
        const cellArea = Math.PI * Math.pow(cellRadius, 2);
        const numberOfCells = totalArea / cellArea;
        
        // 4G : Facteur de réutilisation = 1, mais dégradation SINR
        // Modèle simplifié de dégradation inter-cellulaire
        const interferenceReduction = calculateInterferenceReduction4G(numberOfCells, cellRadius);
        const effectiveCapacityPerCell = theoreticalCapacityPerCell * interferenceReduction;
        
        // Capacité totale = capacité effective par cellule × nombre de cellules
        // (chaque cellule contribue à la capacité totale mais avec dégradation)
        cellularCapacity = numberOfCells * effectiveCapacityPerCell;
        
      } else if (linkType === '5G') {
        latency = 1;
        const frequencyBand = edge.data?.params?.['FrequencyBand'] || 'sub-6';
        const bandwidth = parseFloat(edge.data?.params?.['Bande passante (MHz)'] || 
          (frequencyBand === 'mmWave' ? 400 : 100));
        const mimoLayers = parseFloat(edge.data?.params?.['Couches MIMO'] || 
          (frequencyBand === 'mmWave' ? 16 : 8));
        const numerologyMu = parseFloat(edge.data?.params?.['Numerology (μ)'] || 1);
        const modulation = edge.data?.params?.['Modulation (QPSK/16QAM/64QAM/256QAM/1024QAM)'] || '256QAM';
        const beamformingGain = parseFloat(edge.data?.params?.['Beamforming gain (dB)'] || 
          (frequencyBand === 'mmWave' ? 20 : 10));
        const cellRadius = parseFloat(edge.data?.params?.['Portée (km)'] || 
          (frequencyBand === 'mmWave' ? 0.5 : 2));
        const totalArea = parseFloat(edge.data?.params?.['Surface totale (km²)'] || 1000);
        
        // Calcul de la numérologie 5G
        const numerologyParams = calculate5GNumerology(frequency, bandwidth, numerologyMu);
        
        // Gain de beamforming pour 5G
        loss -= beamformingGain;
        
        const spectralEfficiency = getSpectralEfficiency('5G', modulation);
        const theoreticalCapacityPerCell = bandwidth * mimoLayers * spectralEfficiency;
        
        const cellArea = Math.PI * Math.pow(cellRadius, 2);
        const numberOfCells = totalArea / cellArea;
        
        // 5G : Beamforming réduit significativement les interférences
        const interferenceReduction = calculate5GInterferenceReduction(
          numberOfCells, 
          cellRadius, 
          beamformingGain, 
          frequencyBand
        );
        const effectiveCapacityPerCell = theoreticalCapacityPerCell * interferenceReduction;
        
        // 5G avec network slicing : capacité peut être partitionnée dynamiquement
        const networkSlicingEfficiency = 0.9; // Overhead du slicing
        cellularCapacity = numberOfCells * effectiveCapacityPerCell * networkSlicingEfficiency;
        
        // Informations numérologie dans les résultats
        console.log(`5G Numerology μ=${numerologyMu}: SCS=${numerologyParams.subcarrierSpacing}kHz, Slot=${numerologyParams.slotDuration}ms`);
      }
    } else {
      // Hertzien (code existant amélioré)
      const frequency = parseFloat(txNode.data.params['Fréquence (GHz)'] || 6);
      const wavelength = 3e8 / (frequency * 1e9);
      const antennaGainTx_dB = parseFloat(txNode.data.params['Gain antenne (dBi)'] || 
        edge.data?.params?.['Gain antenne émettrice (dBi)'] || 45.5);
      const antennaGainRx_dB = parseFloat(rxNode.data.params['Gain antenne (dBi)'] || 
        edge.data?.params?.['Gain antenne réceptrice (dBi)'] || 45.5);
      
      const antennaGainTx = Math.pow(10, antennaGainTx_dB / 10);
      const antennaGainRx = Math.pow(10, antennaGainRx_dB / 10);
      
      const guideLengthTx = parseFloat(edge.data?.params?.['Longueur guide Tx (m)'] || 70);
      const guideLengthRx = parseFloat(edge.data?.params?.['Longueur guide Rx (m)'] || 30);
      const guideLossPer100m = parseFloat(edge.data?.params?.['Perte guide (dB/100m)'] || 5);
      const branchingLoss = parseFloat(edge.data?.params?.['Perte branchements (dB)'] || 5.9);
      const polarization = edge.data?.params?.['Polarisation'] || 'Verticale';
      
      const guideLoss = (guideLengthTx + guideLengthRx) * guideLossPer100m / 100;
      const alpha_B = Math.pow(10, branchingLoss / 10);
      const alpha_G = Math.pow(10, guideLoss / 10);
      
      const power_mW = Math.pow(10, power / 10);
      const pr_mW = power_mW * antennaGainTx * antennaGainRx * 
        Math.pow(wavelength / (4 * Math.PI * distance * 1e3), 2) / (alpha_B * alpha_G);
      
      const receivedPower = 10 * Math.log10(pr_mW);
      loss = power - receivedPower;
      latency = 10;
      coverage = Math.pow(10, (100 - 32.4 - 20 * Math.log10(frequency)) / 20);
    }
  
    // Calcul SNR et capacité Shannon (pour tous les types)
    const receivedPower = power - loss;
    const noiseFloor = linkType === 'Optique' ? -100 : 
      linkType === 'RJ45' ? -80 : 
      linkType === 'GSM' ? -90 : 
      linkType === 'UMTS' ? -92 : 
      linkType === '4G' ? -94 : -95;
    
    const snrLinear = Math.pow(10, (receivedPower - noiseFloor) / 10);
    snr_dB = 10 * Math.log10(snrLinear);
  
    // Bande passante par défaut si non calculée spécifiquement
    let bandwidth = parseFloat(edge.data?.params?.['Bande passante (MHz)'] || 
      txNode.data.params['Bande passante (kHz)'] || 20000) / 1000;
    
    if (linkType === 'GSM') bandwidth = 0.2;
    if (linkType === 'UMTS') bandwidth = 5;
    if (linkType === '4G') bandwidth = 20;
    if (linkType === '5G') bandwidth = edge.data?.params?.['FrequencyBand'] === 'mmWave' ? 400 : 100;
    if (linkType === 'Optique') bandwidth = 1000;
    
    // Capacité Shannon si pas calculée spécifiquement
    if (capacity === 0) {
      capacity = bandwidth * Math.log2(1 + snrLinear);
    }
  
    const result = {
      receivedPower,
      loss,
      capacity,
      coverage,
      latency,
      snr_dB,
      bitrate: bitrate / 1e6, // Conversion en Mbps
      linkType,
    };

    // Ajout des résultats spécifiques
    if (linkType === 'Optique' && margin !== 0) {
      result.margin = margin;
    }
    if (['GSM', 'UMTS', '4G', '5G'].includes(linkType)) {
      if (frequenciesPerCell) result.frequenciesPerCell = frequenciesPerCell;
      if (reuseDistance) result.reuseDistance = reuseDistance;
      if (cellularCapacity) result.cellularCapacity = cellularCapacity;
    }
    
    // Ajout des informations de numérologie 5G
    if (linkType === '5G') {
      const numerologyMu = parseFloat(edge.data?.params?.['Numerology (μ)'] || 1);
      const numerologyParams = calculate5GNumerology(
        parseFloat(txNode.data.params['Fréquence (GHz)'] || 3500), 
        parseFloat(edge.data?.params?.['Bande passante (MHz)'] || 100), 
        numerologyMu
      );
      result.numerologyInfo = numerologyParams;
    }

    return result;

  } catch (error) {
    console.error(`Erreur dans calculateDirectLinkBudget:`, error);
    throw error;
  }
};

function calculateInterferenceReduction4G(numberOfCells, cellRadius) {
  // Modèle simplifié basé sur SINR moyen
  if (numberOfCells <= 1) return 1.0;
  
  // Plus de cellules = plus d'interférences = débit réduit
  // Facteur empirique basé sur les performances réelles 4G
  const densityFactor = Math.sqrt(numberOfCells);
  const interferenceReduction = 1 / (1 + 0.3 * Math.log10(densityFactor));
  
  // ICIC (Inter-Cell Interference Coordination) améliore les performances
  const icicGain = 1.2;
  
  return Math.min(1.0, interferenceReduction * icicGain);
}

function calculate5GInterferenceReduction(numberOfCells, cellRadius, beamformingGain, frequencyBand) {
  if (numberOfCells <= 1) return 1.0;
  
  // 5G : beamforming réduit drastiquement les interférences
  const beamformingEfficiency = 1 - Math.exp(-beamformingGain / 10); // Gain exponentiel
  
  // mmWave : courte portée = moins d'interférences entre cellules
  const frequencyFactor = (frequencyBand === 'mmWave') ? 0.8 : 0.5;
  
  const densityFactor = Math.sqrt(numberOfCells);
  const baseInterferenceReduction = 1 / (1 + frequencyFactor * Math.log10(densityFactor));
  
  // Coordination avancée 5G (CoMP, eICIC)
  const advancedCoordinationGain = 1.4;
  
  const totalReduction = baseInterferenceReduction * (1 + beamformingEfficiency) * advancedCoordinationGain;
  
  return Math.min(1.0, totalReduction);
}

const calculateChainLinkBudget = (sourceNode, targetNode, edge, topologyGraph) => {
  try {
    console.log(`Analyse chaîne: ${sourceNode.data.label} → ${targetNode.data.label}`);
    
    const chainPath = findChainPath(topologyGraph, sourceNode.id, targetNode.id);
    
    if (!chainPath || chainPath.length === 0) {
      return calculateDirectLinkBudget(sourceNode, targetNode, edge);
    }
    
    if (chainPath.length === 1) {
      return calculateDirectLinkBudget(sourceNode, targetNode, chainPath[0].edge);
    }
    
    console.log(`Chaîne détectée avec ${chainPath.length} segments`);
    
    let totalLoss = 0;
    let totalLatency = 0;
    let minCapacity = Infinity;
    let currentPower = parseFloat(sourceNode.data.params['Puissance (dBm)'] || 20);
    let segmentResults = [];
    
    for (let i = 0; i < chainPath.length; i++) {
      const connection = chainPath[i];
      const segmentEdge = connection.edge;
      
      const fromNodeId = connection.reverse ? connection.target : sourceNode.id;
      const toNodeId = connection.target;
      
      const fromNode = nodes.find(n => n.id === fromNodeId);
      const toNode = nodes.find(n => n.id === toNodeId);
      
      if (!fromNode || !toNode) continue;
      
      const segmentResult = calculateDirectLinkBudget(fromNode, toNode, segmentEdge);
      
      const isRegenerated = isRegenerativeNode(toNode);
      
      if (isRegenerated && i < chainPath.length - 1) {
        console.log(`Segment ${i + 1}: ${fromNode.data.label} → ${toNode.data.label} (régénéré)`);
        console.log(`  Perte segment: ${segmentResult.loss.toFixed(2)} dB, Signal régénéré`);
        
        totalLatency += segmentResult.latency;
        minCapacity = Math.min(minCapacity, segmentResult.capacity);
        
        currentPower = parseFloat(toNode.data.params['Puissance (dBm)'] || currentPower);
        
      } else {
        console.log(`Segment ${i + 1}: ${fromNode.data.label} → ${toNode.data.label} (passif)`);
        console.log(`  Perte segment: ${segmentResult.loss.toFixed(2)} dB (cumulative)`);
        
        totalLoss += segmentResult.loss;
        totalLatency += segmentResult.latency;
        minCapacity = Math.min(minCapacity, segmentResult.capacity);
        currentPower -= segmentResult.loss;
      }
      
      segmentResults.push({
        from: fromNode.data.label,
        to: toNode.data.label,
        loss: segmentResult.loss,
        isRegenerated,
        powerAfter: currentPower
      });
    }
    
    const startPower = parseFloat(sourceNode.data.params['Puissance (dBm)'] || 20);
    const finalPower = currentPower;
    
    console.log(`Chaîne complète: Puissance initiale ${startPower} dBm → Puissance finale ${finalPower.toFixed(2)} dBm`);
    console.log(`Perte totale effective: ${(startPower - finalPower).toFixed(2)} dB`);
    
    const linkType = edge.data?.params?.['Type liaison'] || 'Hertzien';
    const noiseFloor = linkType === 'Optique' ? -100 : linkType === 'RJ45' ? -80 : linkType === 'GSM' ? -90 : linkType === 'UMTS' ? -92 : linkType === '4G' ? -94 : -95;
    const snrLinear = Math.pow(10, (finalPower - noiseFloor) / 10);
    const snr_dB = 10 * Math.log10(snrLinear);
    
    return {
      receivedPower: finalPower,
      loss: startPower - finalPower,
      capacity: minCapacity,
      latency: totalLatency,
      snr_dB,
      segmentCount: chainPath.length,
      segmentResults,
      isChainLink: true,
      note: `Liaison en chaîne de ${chainPath.length} segments`
    };
    
  } catch (error) {
    console.error(`Erreur dans calculateChainLinkBudget:`, error);
    throw error;
  }
};

// ENDPOINT AMÉLIORÉ avec validation
app.post('/api/calculate', (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ error: 'Nodes and edges are required' });
    }

    // Validation améliorée des paramètres 5G
    const validationErrors = [];
    edges.forEach(edge => {
      if (edge.data?.params?.['Type liaison'] === '5G') {
        const frequencyBand = edge.data?.params?.['FrequencyBand'];
        if (!['sub-6', 'mmWave'].includes(frequencyBand)) {
          validationErrors.push(`Edge ${edge.id}: FrequencyBand must be 'sub-6' or 'mmWave'`);
        }
        
        const numerology = edge.data?.params?.['Numerology (μ)'];
        if (numerology !== undefined && ![0,1,2,3,4].includes(parseInt(numerology))) {
          validationErrors.push(`Edge ${edge.id}: Numerology (μ) must be 0, 1, 2, 3, or 4`);
        }
        
        // Validation de cohérence fréquence/bande
        const sourceNode = nodes.find(n => n.id === edge.source);
        const frequency = parseFloat(sourceNode?.data?.params?.['Fréquence (MHz)'] || 3500);
        if (frequencyBand === 'mmWave' && frequency < 24000) {
          validationErrors.push(`Edge ${edge.id}: mmWave requires frequency >= 24 GHz`);
        }
        if (frequencyBand === 'sub-6' && frequency >= 6000) {
          validationErrors.push(`Edge ${edge.id}: sub-6 requires frequency < 6 GHz`);
        }
      }
      
      // Validation RJ45 distance
      if (edge.data?.params?.['Type liaison'] === 'RJ45') {
        const distance = parseFloat(edge.data?.params?.['Portée (km)'] || 0.1);
        if (distance > 0.1) {
          validationErrors.push(`Edge ${edge.id}: RJ45 maximum distance is 100m (0.1 km)`);
        }
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors', 
        details: validationErrors 
      });
    }

    let totalCost = 0;
    nodes.forEach((node) => {
      const cost = parseFloat(node.data.params['Coût unitaire (CFA)'] || 0);
      if (!isNaN(cost)) totalCost += cost;
    });

    const topologyGraph = buildTopologyGraph(nodes, edges);

    const results = edges.map((edge) => {
      try {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) {
          return { edgeId: edge.id, error: 'Source or target node not found' };
        }

        const result = calculateChainLinkBudget(sourceNode, targetNode, edge, topologyGraph);

        return {
          edgeId: edge.id,
          ...result,
        };
      } catch (error) {
        console.error(`Erreur pour l'arête ${edge.id}:`, error);
        return { 
          edgeId: edge.id, 
          error: `Erreur de calcul: ${error.message}` 
        };
      }
    });

    res.json({ results, totalCost });
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// 5. AJOUT D'UN ENDPOINT POUR OBTENIR LES PARAMÈTRES PAR DÉFAUT
app.get('/api/default-params/:linkType', (req, res) => {
  const { linkType } = req.params;
  
  const defaultParams = {
    'Optique': {
      'Atténuation (dB/km)': 0.2,
      'Perte connecteurs (dB)': 0.4,
      'Perte épissures (dB)': 0.1,
      'Sensibilité récepteur (dBm)': -30,
      'Longueur d\'onde (nm)': 1550,
      'Ouverture numérique': 0.1
    },
    'Hertzien': {
      'Fréquence (GHz)': 6,
      'Perte guide (dB/100m)': 5,
      'Perte branchements (dB)': 5.9,
      'Gain antenne émettrice (dBi)': 45.5,
      'Gain antenne réceptrice (dBi)': 45.5,
      'Polarisation': 'Verticale'
    },
    'GSM': {
      'Fréquence (MHz)': 900,
      'Total fréquences': 15,
      'Rayon cellule (km)': 1,
      'Gain antenne émettrice (dBi)': 15,
      'Gain antenne réceptrice (dBi)': 15
    },
    'UMTS': {
      'Fréquence (MHz)': 2100,
      'Bande passante (MHz)': 5,
      'Gain antenne émettrice (dBi)': 17,
      'Gain antenne réceptrice (dBi)': 17,
      'Facteur d\'étalement (SF)': 128
    },
    '4G': {
      'Fréquence (MHz)': 2600,
      'Bande passante (MHz)': 20,
      'Couches MIMO': 2,
      'Gain antenne émettrice (dBi)': 18,
      'Gain antenne réceptrice (dBi)': 18,
      'Modulation (QPSK/16QAM/64QAM/256QAM)': '64QAM'
    },
    '5G': {
      'FrequencyBand': 'sub-6',
      'Fréquence (MHz)': 3500,
      'Bande passante (MHz)': 100,
      'Couches MIMO': 8,
      'Gain antenne émettrice (dBi)': 18,
      'Gain antenne réceptrice (dBi)': 18,
      'Numerology (μ)': 1,
      'Modulation (QPSK/16QAM/64QAM/256QAM/1024QAM)': '256QAM'
    },
    'RJ45': {
      'Catégorie': 'Cat6',
      'Portée (km)': 0.1,
      'Impédance caractéristique (Ω)': 100,
      'Débit nominal (Mbps)': 1000
    },
    '5G-mmWave': {
      'FrequencyBand': 'mmWave',
      'Fréquence (MHz)': 28000,  // Fréquence mmWave valide
      'Bande passante (MHz)': 400,
      // ...
    }
  };
  
  if (defaultParams[linkType]) {
    res.json(defaultParams[linkType]);
  } else {
    res.status(404).json({ error: 'Link type not found' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));