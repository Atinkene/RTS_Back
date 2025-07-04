export const linkParams = {
  'Optique': {
    params: [
      'Atténuation (dB/km)', 
      'Perte connecteurs (dB)', 
      'Perte épissures (dB)', 
      'Sensibilité récepteur (dBm)', 
      'Portée (km)', 
      'Rapidité modulation (bauds)', 
      'Valence', 
      'Longueur d\'onde (nm)', 
      'Ouverture numérique',
    ],
    style: { 
      stroke: '#ef4444', // Rouge vif
      strokeWidth: 4,
      strokeDasharray: '2,2', // Pointillés serrés
    }
  },
  'Hertzien': {
    params: [
      'Longueur guide Tx (m)', 
      'Longueur guide Rx (m)', 
      'Perte guide (dB/100m)', 
      'Perte branchements (dB)', 
      'Perte câble (dB)', 
      'Portée (km)', 
      'Rapidité modulation (bauds)', 
      'Valence', 
      'Polarisation'
    ],
    style: { 
      stroke: '#8b5cf6', // Violet vif
      strokeWidth: 3,
      strokeDasharray: '12,4,2,4', // Motif morse
    }
  },
  'GSM': {
    params: [
      'Total fréquences', 
      'Rayon cellule (km)', 
      'Surface totale (km²)', 
      'Perte câble (dB)', 
      'i', 
      'j', 
      'Rapidité modulation (bauds)', 
      'Valence'
    ],
    style: { 
      stroke: '#22c55e', // Vert vif
      strokeWidth: 3,
      strokeDasharray: '0', // Ligne continue
    }
  },
  'UMTS': {
    params: [
      'Bande passante (MHz)', 
      'Rayon cellule (km)', 
      'Surface totale (km²)', 
      'Perte câble (dB)', 
      'Rapidité modulation (bauds)', 
      'Valence', 
      'Facteur d\'étalement (SF)'
    ],
    style: { 
      stroke: '#3b82f6', // Bleu vif
      strokeWidth: 3,
      strokeDasharray: '8,4', // Tirets longs
    }
  },
  '4G': {
    params: [
      'Bande passante (MHz)', 
      'Couches MIMO', 
      'Rayon cellule (km)', 
      'Surface totale (km²)', 
      'Perte câble (dB)', 
      'Rapidité modulation (bauds)', 
      'Valence', 
      'Modulation (QPSK/16QAM/64QAM/256QAM)', 
      'Code rate'
    ],
    style: { 
      stroke: '#f59e0b', // Orange vif
      strokeWidth: 4,
      strokeDasharray: '0', // Ligne continue
    }
  },
  '5G': {
    params: [
      'FrequencyBand', 
      'Fréquence (GHz)', // Uniformisé en GHz pour 5G
      'Bande passante (MHz)', 
      'Couches MIMO', 
      'Rayon cellule (km)', 
      'Surface totale (km²)', 
      'Perte câble (dB)', 
      'Rapidité modulation (bauds)', 
      'Valence', 
      'Numerology (μ)', 
      'Modulation (QPSK/16QAM/64QAM/256QAM/1024QAM)', 
      'Beamforming gain (dB)'
    ],
    style: { 
      stroke: '#ec4899', // Rose vif
      strokeWidth: 4,
      strokeDasharray: '6,2,2,2', // Motif complexe
    }
  },
  'RJ45': {
    params: [
      'Catégorie', 
      'Portée (km)', 
      'Rapidité modulation (bauds)', 
      'Impédance caractéristique (Ω)', 
      'Atténuation (dB/100m)', 
      'Fréquence maximale (MHz)', 
      'Débit nominal (Mbps)',
    ],
    style: { 
      stroke: '#06b6d4', // Cyan vif
      strokeWidth: 2,
      strokeDasharray: '4,4', // Pointillés réguliers
    }
  },
};

// Mise à jour des équipements avec des paramètres plus cohérents
export const equipmentConfig = {
  'GSM (2G)': {
    equipments: [
      { 
        type: 'BTS', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Fréquence (MHz)', 
          'Capacité (Mbps)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'BSC', 
        isPassive: true, 
        params: ['Capacité BTS', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'MSC', 
        isPassive: true, 
        params: ['Capacité appels (par heure)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'HLR', 
        isPassive: true, 
        params: ['Abonnés max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'VLR', 
        isPassive: true, 
        params: ['Abonnés itinérants', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Antenne GSM', 
        isActive: true, 
        params: [
          'Gain antenne (dBi)', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (MHz)',
          'Bande passante (MHz)',
          'Type polarisation'
        ] 
      },
    ],
  },
  'UMTS (3G)': {
    equipments: [
      { 
        type: 'NodeB', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Fréquence (MHz)', 
          'Capacité (Mbps)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'RNC', 
        isPassive: true, 
        params: ['Capacité NodeB', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'MSC', 
        isPassive: true, 
        params: ['Capacité appels (par heure)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'SGSN', 
        isPassive: true, 
        params: ['Débit données (Mbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'GGSN', 
        isPassive: true, 
        params: ['Débit données (Mbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Antenne UMTS', 
        isActive: true, 
        params: [
          'Gain antenne (dBi)', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (MHz)',
          'Bande passante (MHz)',
          'Type polarisation'
        ] 
      },
    ],
  },
  '4G (LTE)': {
    equipments: [
      { 
        type: 'eNodeB', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Bande passante (MHz)', 
          'Capacité (Mbps)', 
          'Coût unitaire (CFA)', 
          'Couches MIMO', 
          'Gain antenne (dBi)',
          'Fréquence (MHz)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'EPC', 
        isPassive: true, 
        params: ['Sessions max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Antenne LTE', 
        isActive: true, 
        params: [
          'Gain antenne (dBi)', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (MHz)',
          'Bande passante (MHz)',
          'Couches MIMO supportées'
        ] 
      },
      { 
        type: 'RRH', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Fréquence (MHz)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'BBU', 
        isPassive: true, 
        params: ['Capacité (Mbps)', 'Coût unitaire (CFA)'] 
      },
    ],
  },
  '5G (NR)': {
    equipments: [
      { 
        type: 'gNodeB', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Bande passante (MHz)', 
          'Couches MIMO', 
          'Latence (ms)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)', 
          'Numerology (μ)',
          'Fréquence (GHz)', // Uniformisé en GHz
          'Sensibilité récepteur (dBm)',
          'FrequencyBand'
        ] 
      },
      { 
        type: '5GC', 
        isPassive: true, 
        params: ['Sessions max', 'Latence (ms)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Antenne Massive MIMO', 
        isActive: true, 
        params: [
          'Gain antenne (dBi)', 
          'Beams', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (GHz)', // Uniformisé en GHz
          'Bande passante (MHz)',
          'Ouverture faisceau (°)'
        ] 
      },
      { 
        type: 'Small Cell', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Portée (m)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Fréquence (GHz)', // Uniformisé en GHz
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'RRH', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Fréquence (GHz)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'BBU', 
        isPassive: true, 
        params: ['Capacité (Mbps)', 'Coût unitaire (CFA)'] 
      },
    ],
  },
  'Réseaux IP': {
    equipments: [
      { 
        type: 'Routeur', 
        isPassive: true, 
        isRegenerative: true, 
        params: ['Débit (Gbps)', 'Ports', 'Protocole', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Switch', 
        isPassive: true, 
        isRegenerative: true, 
        params: ['Ports', 'Débit (Gbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Modem', 
        isPassive: true, 
        params: ['Débit (Mbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Firewall', 
        isPassive: true, 
        params: ['Règles', 'Débit (Gbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'NAT Gateway', 
        isPassive: true, 
        params: ['Sessions max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Serveur DHCP', 
        isPassive: true, 
        params: ['Adresses max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Serveur DNS', 
        isPassive: true, 
        params: ['Requêtes par seconde', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Load Balancer', 
        isPassive: true, 
        params: ['Connexions max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'SDN Controller', 
        isPassive: true, 
        params: ['Règles max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Proxy Server', 
        isPassive: true, 
        params: ['Connexions max', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Packet Broker', 
        isPassive: true, 
        params: ['Débit (Gbps)', 'Coût unitaire (CFA)'] 
      },
    ],
  },
  'Liaisons Hertziennes': {
    equipments: [
      { 
        type: 'Antenne Micro-onde', 
        isActive: true, 
        params: [
          'Fréquence (GHz)', 
          'Gain antenne (dBi)', 
          'Portée (km)', 
          'Débit (Mbps)', 
          'Coût unitaire (CFA)', 
          'Polarisation',
          'Ouverture faisceau (°)'
        ] 
      },
      { 
        type: 'Émetteur/Récepteur Radio', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Fréquence (GHz)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'Modem Radio', 
        isPassive: true, 
        params: ['Débit (Mbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Multiplexeur TDM/IP', 
        isPassive: true, 
        params: ['Canaux', 'Perte branchements (dB)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Tour/Pylône', 
        isPassive: true, 
        params: ['Hauteur (m)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Parabole Satellite', 
        isActive: true, 
        params: [
          'Diamètre (m)', 
          'Gain antenne (dBi)', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (GHz)'
        ] 
      },
      { 
        type: 'Transpondeur Satellite', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Bande passante (MHz)', 
          'Coût unitaire (CFA)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'Guide d\'onde', 
        isPassive: true, 
        params: ['Perte guide (dB/100m)', 'Longueur (m)', 'Coût unitaire (CFA)'] 
      },
    ],
  },
  'Liaisons Optiques': {
    equipments: [
      { 
        type: 'Fibre Optique', 
        isPassive: true, 
        params: [
          'Longueur (km)', 
          'Débit (Gbps)', 
          'Atténuation (dB/km)', 
          'Coût unitaire (CFA)', 
          'Longueur d\'onde (nm)', 
          'Ouverture numérique',
          'Type fibre (SM/MM)',
          'Dispersion chromatique (ps/nm/km)'
        ] 
      },
      { 
        type: 'Multiplexeur CWDM/DWDM', 
        isPassive: true, 
        params: ['Canaux', 'Coût unitaire (CFA)', 'Espacement canal (nm)'] 
      },
      { 
        type: 'Répartiteur Optique (ODF)', 
        isPassive: true, 
        params: ['Ports', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Amplificateur Optique (EDFA)', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Gain (dB)', 
          'Coût unitaire (CFA)',
          'Puissance saturée (dBm)',
          'Figure de bruit (dB)'
        ] 
      },
      { 
        type: 'Convertisseur Optique-Électrique', 
        isActive: true, 
        params: [
          'Débit (Gbps)', 
          'Coût unitaire (CFA)',
          'Sensibilité récepteur (dBm)',
          'Puissance émission (dBm)'
        ] 
      },
      { 
        type: 'Switch Optique', 
        isPassive: true, 
        params: ['Ports', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Connecteur Optique', 
        isPassive: true, 
        params: ['Perte (dB)', 'Coût unitaire (CFA)', 'Type connecteur'] 
      },
    ],
  },
  'Équipements CPE': {
    equipments: [
      { 
        type: 'Modem LTE/5G', 
        isActive: true, 
        params: [
          'Débit (Mbps)', 
          'Bande passante (MHz)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Fréquence (MHz)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'Box Internet', 
        isPassive: true, 
        params: ['Débit (Mbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Antenne Fixe LTE/WiMAX', 
        isActive: true, 
        params: [
          'Gain antenne (dBi)', 
          'Coût unitaire (CFA)',
          'Fréquence centrale (MHz)',
          'Bande passante (MHz)'
        ] 
      },
      { 
        type: 'Wi-Fi AP', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Canaux', 
          'Débit (Mbps)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Fréquence (MHz)'
        ] 
      },
      { 
        type: 'Femtocell', 
        isActive: true, 
        params: [
          'Puissance (dBm)', 
          'Coût unitaire (CFA)', 
          'Gain antenne (dBi)',
          'Fréquence (MHz)',
          'Portée (m)'
        ] 
      },
      { 
        type: 'ONT', 
        isPassive: true, 
        params: ['Débit (Gbps)', 'Coût unitaire (CFA)'] 
      },
      { 
        type: 'Set-Top Box', 
        isPassive: true, 
        params: ['Résolution (p)', 'Coût unitaire (CFA)'] 
      },
    ],
  },
  'Répéteurs/Amplificateurs': {
    equipments: [
      { 
        type: 'Répéteur', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Gain (dB)', 
          'Coût unitaire (CFA)',
          'Fréquence (MHz)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
      { 
        type: 'Amplificateur', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Gain (dB)', 
          'Coût unitaire (CFA)',
          'Fréquence (MHz)',
          'Figure de bruit (dB)'
        ] 
      },
      { 
        type: 'Régénérateur', 
        isActive: true, 
        isRegenerative: true, 
        params: [
          'Puissance (dBm)', 
          'Coût unitaire (CFA)',
          'Fréquence (MHz)',
          'Sensibilité récepteur (dBm)'
        ] 
      },
    ],
  },
};

export const linkCompatibility = {
  'GSM (2G)': ['GSM'],
  'UMTS (3G)': ['UMTS'],
  '4G (LTE)': ['4G'],
  '5G (NR)': ['5G'],
  'Réseaux IP': ['RJ45', 'Optique'],
  'Liaisons Hertziennes': ['Hertzien'],
  'Liaisons Optiques': ['Optique'],
  'Équipements CPE': ['RJ45', 'Optique', 'GSM', 'UMTS', '4G', '5G'],
  'Répéteurs/Amplificateurs': ['Hertzien', 'Optique'],
};

export const getEquipmentProperties = (type) => {
  for (const network in equipmentConfig) {
    const equipment = equipmentConfig[network].equipments.find(eq => eq.type === type);
    if (equipment) {
      return { ...equipment, network };
    }
  }
  return null;
};

export const getCompatibleLinkTypes = (sourceType, targetType) => {
  const sourceNetwork = Object.keys(equipmentConfig).find(network =>
    equipmentConfig[network].equipments.some(eq => eq.type === sourceType)
  );
  const targetNetwork = Object.keys(equipmentConfig).find(network =>
    equipmentConfig[network].equipments.some(eq => eq.type === targetType)
  );

  if (!sourceNetwork || !targetNetwork) return [];
  if (sourceNetwork === targetNetwork) return linkCompatibility[sourceNetwork] || [];
  return [...new Set([...(linkCompatibility[sourceNetwork] || []), ...(linkCompatibility[targetNetwork] || [])])];
};