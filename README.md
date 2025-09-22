# RTS Backend - API de Dimensionnement Réseau

## Description

API RESTful développée en Node.js/Express pour le calcul et la simulation de réseaux de télécommunications multi-technologies. Cette solution backend fournit des algorithmes robustes pour l'estimation des ressources et les bilans de liaison sur différentes technologies réseau (GSM, UMTS, LTE, 5G, optique, hertzien, RJ45).

## Architecture

### Structure du Projet

```
backend/
├── src/
│   ├── routes/
│   │   └── api.js                    # Routes API principales
│   ├── controllers/
│   │   └── calculator.js             # Contrôleurs de calcul
│   ├── data/
│   │   ├── equipments.js             # Base de données équipements
│   │   └── equipmentsConfig.js       # Configurations par défaut
│   ├── utils/
│   │   ├── calculations.js           # Algorithmes de calcul réseau
│   │   └── validation.js             # Validation des paramètres
│   └── middleware/
│       └── cors.js                   # Configuration CORS
├── server.js                         # Point d'entrée serveur
├── package.json                      # Dépendances et scripts
├── .env.example                      # Variables d'environnement
└── README.md
```

## Fonctionnalités Techniques

### Calculs Réseau Supportés

#### Technologies Cellulaires
- **GSM**: Clusters (N=7), fréquences de réutilisation, distance de réutilisation
- **UMTS**: Facteur d'étalement, calcul de charge, gestion interférences
- **4G/LTE**: Efficacité spectrale, MIMO, ICIC
- **5G**: Numérologie (15×2^μ kHz), beamforming, CoMP, slicing réseau

#### Technologies Filaires et Hertziennes
- **Optique**: Pertes d'insertion, dispersion chromatique, budget optique
- **Hertzien**: Formule de Friis, zone de Fresnel, calculs de propagation
- **RJ45**: Pertes par distance, limitations de portée (100m)

### Algorithmes de Calcul

#### Bilan de Liaison Hertzien
```javascript
// Formule de Friis
const pathLoss = 20 * Math.log10(distance) + 20 * Math.log10(frequency) + 32.44;
const receivedPower = txPower + txGain + rxGain - pathLoss;
const snr = receivedPower - noiseFloor;
```

#### Budget Optique
```javascript
const fiberLoss = distance * attenuationPerKm;
const totalLoss = fiberLoss + connectorLoss + spliceLoss;
const opticalMargin = txPower - totalLoss - rxSensitivity;
```

#### Capacité Shannon
```javascript
const capacity = bandwidth * Math.log2(1 + Math.pow(10, snr/10));
```

## Installation et Configuration

### Prérequis
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation
```bash
git clone https://github.com/Atinkene/RTS_Back.git
cd RTS_Back
npm install
```

### Variables d'Environnement
```bash
cp .env.example .env
```

Configurer le fichier `.env`:
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
API_VERSION=v1
LOG_LEVEL=info
```

### Démarrage
```bash
# Mode développement avec hot-reload
npm run dev

# Mode production
npm start

# Tests
npm test

# Linting
npm run lint
```

## API Endpoints

### POST /api/calculate
Effectue les calculs de dimensionnement pour une topologie réseau complète.

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "data": {
        "type": "BTS",
        "technology": "GSM", 
        "power": 43,
        "cost": 50000,
        "frequency": 900,
        "antennaGain": 18,
        "coordinates": { "lat": 14.6937, "lng": -17.4441 }
      }
    },
    {
      "id": "node_2", 
      "data": {
        "type": "BSC",
        "technology": "GSM",
        "power": 0,
        "cost": 100000
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "data": {
        "type": "hertzien",
        "distance": 10,
        "frequency": 2400,
        "bandwidth": 20
      }
    }
  ]
}
```

**Réponse:**
```json
{
  "success": true,
  "results": [
    {
      "linkId": "edge_1",
      "linkType": "hertzien",
      "sourceNode": "node_1",
      "targetNode": "node_2", 
      "calculations": {
        "transmittedPower": 43,
        "receivedPower": -65.2,
        "pathLoss": 108.2,
        "snr": 25.8,
        "capacity": 150.5,
        "opticalMargin": 15.0,
        "latency": 0.033,
        "coverage": 12.5
      },
      "validation": {
        "isValid": true,
        "warnings": [],
        "errors": []
      }
    }
  ],
  "summary": {
    "totalCost": 150000,
    "totalNodes": 2,
    "totalLinks": 1,
    "averageLatency": 0.033
  },
  "suggestions": [
    {
      "type": "optimization",
      "priority": "medium",
      "description": "Réduire la distance entre BTS pour améliorer la couverture",
      "impact": "Amélioration SNR de 3dB"
    }
  ]
}
```

### GET /api/default-params/:linkType
Retourne les paramètres par défaut pour un type de liaison spécifique.

**Paramètres:**
- `linkType`: Type de liaison (hertzien, optique, rj45, gsm, 5g)

**Réponse:**
```json
{
  "linkType": "hertzien",
  "defaultParams": {
    "frequency": 2400,
    "bandwidth": 20,
    "txPower": 30,
    "antennaGain": 23,
    "cableLength": 0,
    "atmosphericLoss": 0.1
  }
}
```

### GET /api/health
Endpoint de santé pour le monitoring.

**Réponse:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

## Validation et Contraintes

### Contraintes par Technologie

#### GSM
- Fréquences uniques par cellule dans un cluster
- Cluster N = i² + j² + i×j (généralement N=7)
- Distance de réutilisation D = R × √(3×N)
- Fréquences supportées: 850, 900, 1800, 1900 MHz

#### 5G
- Numérologie μ ∈ [0,4] 
- Fréquences sub-6 GHz (< 6 GHz) ou mmWave (≥ 24 GHz)
- Efficacité de slicing réseau: 90%
- Beamforming et CoMP supportés

#### RJ45
- Distance maximale: 100m
- Catégories supportées: Cat5e, Cat6, Cat6a
- Validation de la compatibilité câble/débit

#### Optique
- Validation budget optique
- Vérification dispersion chromatique
- Contrôle puissance optique minimale/maximale

### Gestion d'Erreurs

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Paramètres de liaison invalides",
    "details": {
      "field": "frequency",
      "value": -1,
      "constraint": "La fréquence doit être positive"
    }
  }
}
```

## Technologies et Dépendances

### Core
- **Node.js**: Runtime JavaScript côté serveur
- **Express.js**: Framework web minimaliste
- **cors**: Middleware CORS pour requêtes cross-origin

### Utilitaires
- **lodash**: Utilitaires JavaScript pour manipulations de données
- **joi**: Validation de schémas pour les paramètres d'entrée
- **winston**: Logging structuré avec rotation de fichiers

### Développement
- **nodemon**: Hot-reload en mode développement  
- **jest**: Framework de tests unitaires
- **eslint**: Linting du code JavaScript
- **prettier**: Formatage automatique du code

## Algorithmes Spécialisés

### Optimisation GSM
```javascript
// Calcul cluster GSM optimal
function calculateGSMCluster(i, j) {
  const N = Math.pow(i, 2) + Math.pow(j, 2) + i * j;
  const reuseDistance = cellRadius * Math.sqrt(3 * N);
  const frequencies = totalFrequencies / N;
  return { N, reuseDistance, frequencies };
}
```

### Calculs 5G Avancés
```javascript
// Numérologie 5G
function calculate5GNumerology(mu) {
  const subcarrierSpacing = 15 * Math.pow(2, mu); // kHz
  const slotDuration = 1 / (2 * subcarrierSpacing); // ms
  const symbolsPerSlot = 14; // OFDM symbols
  return { subcarrierSpacing, slotDuration, symbolsPerSlot };
}
```

### Propagation Hertzienne
```javascript
// Zone de Fresnel
function fresnelZone(distance, frequency) {
  const wavelength = 3e8 / (frequency * 1e6); // mètres
  const radius = Math.sqrt(wavelength * distance / 4); // mètres
  return radius;
}
```

## Déploiement

### Render
Le backend est déployé automatiquement sur Render via GitHub.

**Configuration Render:**
```yaml
# render.yaml
services:
  - type: web
    name: rts-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Variables d'Environnement Production
```env
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://rts-front.vercel.app
LOG_LEVEL=warn
```

## Monitoring et Logs

### Logging
```javascript
// Configuration Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Métriques
- Temps de réponse moyen par endpoint
- Taux d'erreur par type de calcul
- Utilisation mémoire et CPU
- Nombre de calculs par technologie

## Tests

### Tests Unitaires
```bash
npm test
```

### Tests d'Intégration
```bash
npm run test:integration
```

### Coverage
```bash
npm run test:coverage
```

### Exemple de Test
```javascript
// __tests__/calculations.test.js
describe('Hertzien Calculations', () => {
  test('should calculate path loss correctly', () => {
    const result = calculateHertzienPathLoss(10, 2400);
    expect(result.pathLoss).toBeCloseTo(100.04, 2);
    expect(result.freeSpaceLoss).toBeGreaterThan(0);
  });
});
```

## Contribution

### Standards de Code
- Respecter ESLint configuration
- Couverture de tests > 80%
- Documentation JSDoc pour fonctions publiques
- Commits selon Conventional Commits

### Processus
1. Fork du repository
2. Création branche feature (`git checkout -b feature/nouveau-calcul`)
3. Implémentation avec tests
4. Commit avec message descriptif
5. Push et Pull Request

## Support et Documentation

### Issues GitHub
Utiliser les templates fournis pour:
- Bug reports
- Feature requests  
- Questions techniques

### Documentation API
Documentation interactive disponible via Postman Collection.

## Licence

MIT License - Voir fichier LICENSE pour détails complets.

## Auteurs

Développé dans le cadre du cours "Réseaux Télécoms et Services" - Dr Mangoné FALL
Université Cheikh Anta Diop de Dakar

---

**Version:** 1.0.0  
**Dernière mise à jour:** Janvier 2025  
**Support:** [Issues GitHub](https://github.com/Atinkene/RTS_Back/issues)
