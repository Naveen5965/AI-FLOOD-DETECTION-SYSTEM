const DEFAULT_API_BASE = 'http://127.0.0.1:8000';
const currentOrigin = window.location.origin;
const API_BASE = currentOrigin.startsWith('http') && currentOrigin !== 'file://'
  ? currentOrigin
  : DEFAULT_API_BASE;
const API_URL = `${API_BASE}/assess`;
const HISTORY_URL = `${API_BASE}/history`;

const FEATURES = [
  'MonsoonIntensity',
  'TopographyDrainage',
  'RiverManagement',
  'Deforestation',
  'Urbanization',
  'ClimateChange',
  'DamsQuality',
  'Siltation',
  'AgriculturalPractices',
  'Encroachments',
  'IneffectiveDisasterPreparedness',
  'DrainageSystems',
  'CoastalVulnerability',
  'Landslides',
  'Watersheds',
  'DeterioratingInfrastructure',
  'PopulationScore',
  'WetlandLoss',
  'InadequatePlanning',
  'PoliticalFactors'
];

const featureDefaults = {
  MonsoonIntensity: 0,
  TopographyDrainage: 0,
  RiverManagement: 0,
  Deforestation: 0,
  Urbanization: 0,
  ClimateChange: 0,
  DamsQuality: 0,
  Siltation: 0,
  AgriculturalPractices: 0,
  Encroachments: 0,
  IneffectiveDisasterPreparedness: 0,
  DrainageSystems: 0,
  CoastalVulnerability: 0,
  Landslides: 0,
  Watersheds: 0,
  DeterioratingInfrastructure: 0,
  PopulationScore: 0,
  WetlandLoss: 0,
  InadequatePlanning: 0,
  PoliticalFactors: 0
};

const form = document.getElementById('scenarioForm');
const featureControls = document.getElementById('featureControls');
const heroSummary = document.getElementById('heroSummary');
const riskSummary = document.getElementById('riskSummary');
const driversContainer = document.getElementById('drivers');
const actionsContainer = document.getElementById('actions');
const historyContainer = document.getElementById('history');
const sampleBtn = document.getElementById('loadSample');

// Initialize map centered on India
let map;
let markers = [];
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function initMap() {
  map = L.map('map').setView(INDIA_CENTER, DEFAULT_ZOOM);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
}

// District coordinates lookup - comprehensive coverage across India
const districtCoords = {
  // Maharashtra
  'pune': [18.5204, 73.8567],
  'mumbai': [19.0760, 72.8777],
  'nagpur': [21.1458, 79.0882],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  'thane': [19.2183, 72.9781],
  'kolhapur': [16.7050, 74.2433],
  'solapur': [17.6599, 75.9064],
  
  // Delhi NCR
  'delhi': [28.7041, 77.1025],
  'new delhi': [28.6139, 77.2090],
  'noida': [28.5355, 77.3910],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'faridabad': [28.4089, 77.3178],
  
  // Karnataka
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'mysore': [12.2958, 76.6394],
  'mysuru': [12.2958, 76.6394],
  'mangalore': [12.9141, 74.8560],
  'hubli': [15.3647, 75.1240],
  'belgaum': [15.8497, 74.4977],
  
  // Tamil Nadu
  'chennai': [13.0827, 80.2707],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'tiruchirappalli': [10.7905, 78.7047],
  'trichy': [10.7905, 78.7047],
  'salem': [11.6643, 78.1460],
  'tirunelveli': [8.7139, 77.7567],
  
  // West Bengal
  'kolkata': [22.5726, 88.3639],
  'howrah': [22.5958, 88.2636],
  'durgapur': [23.5204, 87.3119],
  'asansol': [23.6739, 86.9524],
  'siliguri': [26.7271, 88.3953],
  
  // Telangana
  'hyderabad': [17.3850, 78.4867],
  'warangal': [17.9689, 79.5941],
  'nizamabad': [18.6725, 78.0941],
  'karimnagar': [18.4386, 79.1288],
  
  // Gujarat
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'vadodara': [22.3072, 73.1812],
  'rajkot': [22.3039, 70.8022],
  'bhavnagar': [21.7645, 72.1519],
  'jamnagar': [22.4707, 70.0577],
  
  // Bihar
  'patna': [25.5941, 85.1376],
  'gaya': [24.7955, 85.0002],
  'bhagalpur': [25.2425, 86.9842],
  'muzaffarpur': [26.1225, 85.3906],
  
  // Uttar Pradesh
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'agra': [27.1767, 78.0081],
  'varanasi': [25.3176, 82.9739],
  'meerut': [28.9845, 77.7064],
  'allahabad': [25.4358, 81.8463],
  'prayagraj': [25.4358, 81.8463],
  'ghaziabad': [28.6692, 77.4538],
  'bareilly': [28.3670, 79.4304],
  
  // Rajasthan
  'jaipur': [26.9124, 75.7873],
  'jodhpur': [26.2389, 73.0243],
  'udaipur': [24.5854, 73.7125],
  'kota': [25.2138, 75.8648],
  'ajmer': [26.4499, 74.6399],
  'bikaner': [28.0229, 73.3119],
  
  // Madhya Pradesh
  'bhopal': [23.2599, 77.4126],
  'indore': [22.7196, 75.8577],
  'gwalior': [26.2183, 78.1828],
  'jabalpur': [23.1815, 79.9864],
  'ujjain': [23.1765, 75.7885],
  
  // Kerala
  'thiruvananthapuram': [8.5241, 76.9366],
  'kochi': [9.9312, 76.2673],
  'cochin': [9.9312, 76.2673],
  'kozhikode': [11.2588, 75.7804],
  'calicut': [11.2588, 75.7804],
  'thrissur': [10.5276, 76.2144],
  'kollam': [8.8932, 76.6141],
  
  // Punjab
  'chandigarh': [30.7333, 76.7794],
  'ludhiana': [30.9010, 75.8573],
  'amritsar': [31.6340, 74.8723],
  'jalandhar': [31.3260, 75.5762],
  'patiala': [30.3398, 76.3869],
  
  // Haryana
  'faridabad': [28.4089, 77.3178],
  'panipat': [29.3909, 76.9635],
  'ambala': [30.3782, 76.7762],
  'rohtak': [28.8955, 76.5898],
  
  // Odisha
  'bhubaneswar': [20.2961, 85.8245],
  'cuttack': [20.4625, 85.8830],
  'rourkela': [22.2604, 84.8536],
  'puri': [19.8135, 85.8312],
  
  // Assam
  'guwahati': [26.1445, 91.7362],
  'dispur': [26.1433, 91.7898],
  'dibrugarh': [27.4728, 94.9120],
  'silchar': [24.8333, 92.7789],
  
  // Jharkhand
  'ranchi': [23.3441, 85.3096],
  'jamshedpur': [22.8046, 86.2029],
  'dhanbad': [23.7957, 86.4304],
  
  // Uttarakhand
  'dehradun': [30.3165, 78.0322],
  'haridwar': [29.9457, 78.1642],
  'roorkee': [29.8543, 77.8880],
  'haldwani': [29.2183, 79.5130],
  
  // Himachal Pradesh
  'shimla': [31.1048, 77.1734],
  'dharamshala': [32.2190, 76.3234],
  'manali': [32.2396, 77.1887],
  
  // Jammu & Kashmir
  'srinagar': [34.0837, 74.7973],
  'jammu': [32.7266, 74.8570],
  
  // Andhra Pradesh
  'vijayawada': [16.5062, 80.6480],
  'visakhapatnam': [17.6868, 83.2185],
  'guntur': [16.3067, 80.4365],
  'tirupati': [13.6288, 79.4192],
  
  // Chhattisgarh
  'raipur': [21.2514, 81.6296],
  'bhilai': [21.2094, 81.3788],
  'bilaspur': [22.0797, 82.1409],
  
  // Goa
  'panaji': [15.4909, 73.8278],
  'margao': [15.2832, 73.9888],
  'vasco': [15.3989, 73.8157],
  
  // Puducherry
  'puducherry': [11.9416, 79.8083],
  'pondicherry': [11.9416, 79.8083],
  
  // Tripura
  'agartala': [23.8315, 91.2868],
  
  // Meghalaya
  'shillong': [25.5788, 91.8933],
  
  // Manipur
  'imphal': [24.8170, 93.9368],
  
  // Nagaland
  'kohima': [25.6747, 94.1077],
  
  // Mizoram
  'aizawl': [23.7271, 92.7176]
};

// State and district mapping
const stateDistricts = {
  'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati'],
  'Assam': ['Guwahati', 'Dispur', 'Dibrugarh', 'Silchar'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur'],
  'Delhi': ['Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
  'Goa': ['Panaji', 'Margao', 'Vasco'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Rohtak'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Kolhapur', 'Solapur'],
  'Manipur': ['Imphal'],
  'Meghalaya': ['Shillong'],
  'Mizoram': ['Aizawl'],
  'Nagaland': ['Kohima'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  'Puducherry': ['Puducherry'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Tripura': ['Agartala'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Ghaziabad', 'Bareilly'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri']
};

// Populate state dropdown on page load
function populateStateDropdown() {
  const stateSelect = document.getElementById('state');
  const states = Object.keys(stateDistricts).sort();
  
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

// Populate district dropdown based on selected state
function populateDistrictDropdown(state) {
  const districtSelect = document.getElementById('district');
  
  // Clear existing options except the first placeholder
  districtSelect.innerHTML = '<option value="">Select district</option>';
  
  if (state && stateDistricts[state]) {
    stateDistricts[state].forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}

// Sample data for each state - optimized to show all risk bands (LOW, MODERATE, HIGH, SEVERE)
const stateSamples = {
  // LOW RISK states (10-35% score range)
  'Rajasthan': { district: 'Jaipur', MonsoonIntensity: 28, TopographyDrainage: 72, RiverManagement: 75, Deforestation: 25, Urbanization: 45, ClimateChange: 35, DamsQuality: 78, Siltation: 22, Encroachments: 30, DrainageSystems: 70, PopulationScore: 48, WetlandLoss: 25, InadequatePlanning: 35, DeterioratingInfrastructure: 32, CoastalVulnerability: 5, Landslides: 8, AgriculturalPractices: 40, IneffectiveDisasterPreparedness: 30, Watersheds: 65, PoliticalFactors: 25 },
  'Punjab': { district: 'Chandigarh', MonsoonIntensity: 35, TopographyDrainage: 68, RiverManagement: 72, Deforestation: 28, Urbanization: 52, ClimateChange: 38, DamsQuality: 75, Siltation: 28, Encroachments: 35, DrainageSystems: 68, PopulationScore: 55, WetlandLoss: 30, InadequatePlanning: 38, DeterioratingInfrastructure: 35, CoastalVulnerability: 5, Landslides: 10, AgriculturalPractices: 45, IneffectiveDisasterPreparedness: 35, Watersheds: 68, PoliticalFactors: 28 },
  'Haryana': { district: 'Gurgaon', MonsoonIntensity: 38, TopographyDrainage: 65, RiverManagement: 68, Deforestation: 32, Urbanization: 58, ClimateChange: 42, DamsQuality: 72, Siltation: 32, Encroachments: 40, DrainageSystems: 65, PopulationScore: 60, WetlandLoss: 35, InadequatePlanning: 42, DeterioratingInfrastructure: 38, CoastalVulnerability: 5, Landslides: 12, AgriculturalPractices: 48, IneffectiveDisasterPreparedness: 38, Watersheds: 65, PoliticalFactors: 30 },
  'Himachal Pradesh': { district: 'Shimla', MonsoonIntensity: 42, TopographyDrainage: 62, RiverManagement: 65, Deforestation: 35, Urbanization: 35, ClimateChange: 45, DamsQuality: 70, Siltation: 30, Encroachments: 32, DrainageSystems: 65, PopulationScore: 38, WetlandLoss: 35, InadequatePlanning: 40, DeterioratingInfrastructure: 38, CoastalVulnerability: 8, Landslides: 42, AgriculturalPractices: 42, IneffectiveDisasterPreparedness: 35, Watersheds: 62, PoliticalFactors: 28 },
  
  // MODERATE RISK states (35-55% score range)
  'Madhya Pradesh': { district: 'Bhopal', MonsoonIntensity: 52, TopographyDrainage: 55, RiverManagement: 58, Deforestation: 48, Urbanization: 58, ClimateChange: 52, DamsQuality: 60, Siltation: 48, Encroachments: 50, DrainageSystems: 55, PopulationScore: 60, WetlandLoss: 48, InadequatePlanning: 52, DeterioratingInfrastructure: 50, CoastalVulnerability: 5, Landslides: 25, AgriculturalPractices: 52, IneffectiveDisasterPreparedness: 48, Watersheds: 55, PoliticalFactors: 42 },
  'Karnataka': { district: 'Bangalore', MonsoonIntensity: 55, TopographyDrainage: 52, RiverManagement: 55, Deforestation: 52, Urbanization: 65, ClimateChange: 55, DamsQuality: 58, Siltation: 48, Encroachments: 55, DrainageSystems: 52, PopulationScore: 68, WetlandLoss: 50, InadequatePlanning: 55, DeterioratingInfrastructure: 52, CoastalVulnerability: 12, Landslides: 28, AgriculturalPractices: 55, IneffectiveDisasterPreparedness: 52, Watersheds: 52, PoliticalFactors: 45 },
  'Telangana': { district: 'Hyderabad', MonsoonIntensity: 58, TopographyDrainage: 50, RiverManagement: 52, Deforestation: 50, Urbanization: 68, ClimateChange: 55, DamsQuality: 58, Siltation: 52, Encroachments: 58, DrainageSystems: 50, PopulationScore: 70, WetlandLoss: 52, InadequatePlanning: 58, DeterioratingInfrastructure: 55, CoastalVulnerability: 8, Landslides: 22, AgriculturalPractices: 55, IneffectiveDisasterPreparedness: 55, Watersheds: 50, PoliticalFactors: 48 },
  'Chhattisgarh': { district: 'Raipur', MonsoonIntensity: 60, TopographyDrainage: 52, RiverManagement: 50, Deforestation: 55, Urbanization: 55, ClimateChange: 55, DamsQuality: 55, Siltation: 55, Encroachments: 55, DrainageSystems: 50, PopulationScore: 58, WetlandLoss: 55, InadequatePlanning: 58, DeterioratingInfrastructure: 55, CoastalVulnerability: 5, Landslides: 32, AgriculturalPractices: 58, IneffectiveDisasterPreparedness: 55, Watersheds: 52, PoliticalFactors: 50 },
  'Delhi': { district: 'Delhi', MonsoonIntensity: 48, TopographyDrainage: 42, RiverManagement: 45, Deforestation: 35, Urbanization: 85, ClimateChange: 58, DamsQuality: 55, Siltation: 52, Encroachments: 75, DrainageSystems: 40, PopulationScore: 88, WetlandLoss: 58, InadequatePlanning: 62, DeterioratingInfrastructure: 58, CoastalVulnerability: 5, Landslides: 8, AgriculturalPractices: 35, IneffectiveDisasterPreparedness: 55, Watersheds: 45, PoliticalFactors: 55 },
  
  // HIGH RISK states (55-75% score range)
  'Maharashtra': { district: 'Pune', MonsoonIntensity: 72, TopographyDrainage: 45, RiverManagement: 42, Deforestation: 62, Urbanization: 75, ClimateChange: 65, DamsQuality: 45, Siltation: 68, Encroachments: 70, DrainageSystems: 40, PopulationScore: 78, WetlandLoss: 65, InadequatePlanning: 68, DeterioratingInfrastructure: 68, CoastalVulnerability: 25, Landslides: 38, AgriculturalPractices: 62, IneffectiveDisasterPreparedness: 65, Watersheds: 42, PoliticalFactors: 58 },
  'Gujarat': { district: 'Ahmedabad', MonsoonIntensity: 68, TopographyDrainage: 45, RiverManagement: 45, Deforestation: 55, Urbanization: 72, ClimateChange: 65, DamsQuality: 48, Siltation: 62, Encroachments: 65, DrainageSystems: 42, PopulationScore: 75, WetlandLoss: 60, InadequatePlanning: 65, DeterioratingInfrastructure: 62, CoastalVulnerability: 55, Landslides: 18, AgriculturalPractices: 60, IneffectiveDisasterPreparedness: 62, Watersheds: 45, PoliticalFactors: 55 },
  'Uttar Pradesh': { district: 'Lucknow', MonsoonIntensity: 70, TopographyDrainage: 38, RiverManagement: 40, Deforestation: 62, Urbanization: 70, ClimateChange: 62, DamsQuality: 42, Siltation: 72, Encroachments: 72, DrainageSystems: 35, PopulationScore: 80, WetlandLoss: 68, InadequatePlanning: 70, DeterioratingInfrastructure: 65, CoastalVulnerability: 8, Landslides: 15, AgriculturalPractices: 65, IneffectiveDisasterPreparedness: 68, Watersheds: 38, PoliticalFactors: 62 },
  'Tamil Nadu': { district: 'Chennai', MonsoonIntensity: 75, TopographyDrainage: 35, RiverManagement: 40, Deforestation: 58, Urbanization: 78, ClimateChange: 68, DamsQuality: 45, Siltation: 68, Encroachments: 72, DrainageSystems: 32, PopulationScore: 82, WetlandLoss: 70, InadequatePlanning: 72, DeterioratingInfrastructure: 68, CoastalVulnerability: 72, Landslides: 22, AgriculturalPractices: 62, IneffectiveDisasterPreparedness: 68, Watersheds: 35, PoliticalFactors: 60 },
  'Jharkhand': { district: 'Ranchi', MonsoonIntensity: 72, TopographyDrainage: 42, RiverManagement: 42, Deforestation: 68, Urbanization: 62, ClimateChange: 62, DamsQuality: 45, Siltation: 70, Encroachments: 68, DrainageSystems: 38, PopulationScore: 65, WetlandLoss: 68, InadequatePlanning: 68, DeterioratingInfrastructure: 65, CoastalVulnerability: 5, Landslides: 42, AgriculturalPractices: 65, IneffectiveDisasterPreparedness: 65, Watersheds: 40, PoliticalFactors: 58 },
  'Andhra Pradesh': { district: 'Vijayawada', MonsoonIntensity: 75, TopographyDrainage: 38, RiverManagement: 40, Deforestation: 60, Urbanization: 68, ClimateChange: 68, DamsQuality: 45, Siltation: 72, Encroachments: 70, DrainageSystems: 35, PopulationScore: 72, WetlandLoss: 72, InadequatePlanning: 70, DeterioratingInfrastructure: 65, CoastalVulnerability: 68, Landslides: 28, AgriculturalPractices: 65, IneffectiveDisasterPreparedness: 68, Watersheds: 38, PoliticalFactors: 62 },
  'Goa': { district: 'Panaji', MonsoonIntensity: 78, TopographyDrainage: 42, RiverManagement: 48, Deforestation: 58, Urbanization: 62, ClimateChange: 65, DamsQuality: 50, Siltation: 58, Encroachments: 62, DrainageSystems: 42, PopulationScore: 60, WetlandLoss: 65, InadequatePlanning: 62, DeterioratingInfrastructure: 58, CoastalVulnerability: 75, Landslides: 45, AgriculturalPractices: 58, IneffectiveDisasterPreparedness: 62, Watersheds: 42, PoliticalFactors: 55 },
  'Jammu and Kashmir': { district: 'Srinagar', MonsoonIntensity: 65, TopographyDrainage: 42, RiverManagement: 45, Deforestation: 58, Urbanization: 52, ClimateChange: 62, DamsQuality: 48, Siltation: 62, Encroachments: 58, DrainageSystems: 42, PopulationScore: 55, WetlandLoss: 62, InadequatePlanning: 62, DeterioratingInfrastructure: 58, CoastalVulnerability: 8, Landslides: 70, AgriculturalPractices: 55, IneffectiveDisasterPreparedness: 60, Watersheds: 42, PoliticalFactors: 58 },
  
  // SEVERE RISK states (75-95% score range)
  'Assam': { district: 'Guwahati', MonsoonIntensity: 92, TopographyDrainage: 28, RiverManagement: 30, Deforestation: 78, Urbanization: 65, ClimateChange: 75, DamsQuality: 35, Siltation: 88, Encroachments: 80, DrainageSystems: 25, PopulationScore: 68, WetlandLoss: 85, InadequatePlanning: 82, DeterioratingInfrastructure: 78, CoastalVulnerability: 15, Landslides: 72, AgriculturalPractices: 72, IneffectiveDisasterPreparedness: 80, Watersheds: 28, PoliticalFactors: 75 },
  'Bihar': { district: 'Patna', MonsoonIntensity: 95, TopographyDrainage: 22, RiverManagement: 28, Deforestation: 72, Urbanization: 70, ClimateChange: 75, DamsQuality: 32, Siltation: 92, Encroachments: 85, DrainageSystems: 22, PopulationScore: 78, WetlandLoss: 88, InadequatePlanning: 85, DeterioratingInfrastructure: 80, CoastalVulnerability: 10, Landslides: 25, AgriculturalPractices: 75, IneffectiveDisasterPreparedness: 82, Watersheds: 25, PoliticalFactors: 78 },
  'West Bengal': { district: 'Kolkata', MonsoonIntensity: 88, TopographyDrainage: 25, RiverManagement: 32, Deforestation: 68, Urbanization: 82, ClimateChange: 75, DamsQuality: 38, Siltation: 85, Encroachments: 82, DrainageSystems: 25, PopulationScore: 88, WetlandLoss: 85, InadequatePlanning: 82, DeterioratingInfrastructure: 78, CoastalVulnerability: 78, Landslides: 18, AgriculturalPractices: 72, IneffectiveDisasterPreparedness: 80, Watersheds: 28, PoliticalFactors: 75 },
  'Kerala': { district: 'Kochi', MonsoonIntensity: 90, TopographyDrainage: 32, RiverManagement: 35, Deforestation: 72, Urbanization: 68, ClimateChange: 78, DamsQuality: 40, Siltation: 68, Encroachments: 75, DrainageSystems: 30, PopulationScore: 72, WetlandLoss: 78, InadequatePlanning: 75, DeterioratingInfrastructure: 70, CoastalVulnerability: 85, Landslides: 82, AgriculturalPractices: 68, IneffectiveDisasterPreparedness: 75, Watersheds: 30, PoliticalFactors: 72 },
  'Odisha': { district: 'Bhubaneswar', MonsoonIntensity: 92, TopographyDrainage: 28, RiverManagement: 35, Deforestation: 70, Urbanization: 65, ClimateChange: 75, DamsQuality: 38, Siltation: 82, Encroachments: 75, DrainageSystems: 28, PopulationScore: 70, WetlandLoss: 82, InadequatePlanning: 80, DeterioratingInfrastructure: 75, CoastalVulnerability: 82, Landslides: 35, AgriculturalPractices: 70, IneffectiveDisasterPreparedness: 78, Watersheds: 28, PoliticalFactors: 72 },
  'Meghalaya': { district: 'Shillong', MonsoonIntensity: 98, TopographyDrainage: 25, RiverManagement: 32, Deforestation: 75, Urbanization: 48, ClimateChange: 78, DamsQuality: 35, Siltation: 75, Encroachments: 70, DrainageSystems: 28, PopulationScore: 52, WetlandLoss: 80, InadequatePlanning: 80, DeterioratingInfrastructure: 72, CoastalVulnerability: 12, Landslides: 85, AgriculturalPractices: 68, IneffectiveDisasterPreparedness: 78, Watersheds: 25, PoliticalFactors: 70 },
  'Uttarakhand': { district: 'Dehradun', MonsoonIntensity: 85, TopographyDrainage: 30, RiverManagement: 35, Deforestation: 78, Urbanization: 58, ClimateChange: 72, DamsQuality: 38, Siltation: 68, Encroachments: 72, DrainageSystems: 32, PopulationScore: 60, WetlandLoss: 72, InadequatePlanning: 75, DeterioratingInfrastructure: 68, CoastalVulnerability: 10, Landslides: 88, AgriculturalPractices: 65, IneffectiveDisasterPreparedness: 72, Watersheds: 30, PoliticalFactors: 68 },
  'Puducherry': { district: 'Puducherry', MonsoonIntensity: 88, TopographyDrainage: 28, RiverManagement: 38, Deforestation: 62, Urbanization: 70, ClimateChange: 72, DamsQuality: 42, Siltation: 70, Encroachments: 72, DrainageSystems: 30, PopulationScore: 72, WetlandLoss: 75, InadequatePlanning: 72, DeterioratingInfrastructure: 68, CoastalVulnerability: 88, Landslides: 18, AgriculturalPractices: 65, IneffectiveDisasterPreparedness: 72, Watersheds: 30, PoliticalFactors: 68 },
  'Tripura': { district: 'Agartala', MonsoonIntensity: 90, TopographyDrainage: 32, RiverManagement: 38, Deforestation: 72, Urbanization: 55, ClimateChange: 72, DamsQuality: 40, Siltation: 78, Encroachments: 72, DrainageSystems: 30, PopulationScore: 58, WetlandLoss: 80, InadequatePlanning: 78, DeterioratingInfrastructure: 70, CoastalVulnerability: 20, Landslides: 65, AgriculturalPractices: 68, IneffectiveDisasterPreparedness: 75, Watersheds: 32, PoliticalFactors: 70 },
  'Manipur': { district: 'Imphal', MonsoonIntensity: 92, TopographyDrainage: 30, RiverManagement: 38, Deforestation: 75, Urbanization: 52, ClimateChange: 72, DamsQuality: 38, Siltation: 78, Encroachments: 70, DrainageSystems: 30, PopulationScore: 55, WetlandLoss: 82, InadequatePlanning: 78, DeterioratingInfrastructure: 72, CoastalVulnerability: 15, Landslides: 78, AgriculturalPractices: 68, IneffectiveDisasterPreparedness: 75, Watersheds: 30, PoliticalFactors: 72 },
  'Nagaland': { district: 'Kohima', MonsoonIntensity: 94, TopographyDrainage: 28, RiverManagement: 35, Deforestation: 78, Urbanization: 45, ClimateChange: 75, DamsQuality: 38, Siltation: 75, Encroachments: 68, DrainageSystems: 28, PopulationScore: 48, WetlandLoss: 80, InadequatePlanning: 80, DeterioratingInfrastructure: 70, CoastalVulnerability: 12, Landslides: 82, AgriculturalPractices: 70, IneffectiveDisasterPreparedness: 78, Watersheds: 28, PoliticalFactors: 72 },
  'Mizoram': { district: 'Aizawl', MonsoonIntensity: 95, TopographyDrainage: 25, RiverManagement: 35, Deforestation: 80, Urbanization: 48, ClimateChange: 75, DamsQuality: 35, Siltation: 78, Encroachments: 70, DrainageSystems: 28, PopulationScore: 52, WetlandLoss: 82, InadequatePlanning: 82, DeterioratingInfrastructure: 72, CoastalVulnerability: 15, Landslides: 85, AgriculturalPractices: 72, IneffectiveDisasterPreparedness: 80, Watersheds: 25, PoliticalFactors: 75 }
};

// Initialize dropdowns when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  populateStateDropdown();
  
  const stateSelect = document.getElementById('state');
  const districtSelect = document.getElementById('district');
  
  stateSelect.addEventListener('change', (e) => {
    const selectedState = e.target.value;
    populateDistrictDropdown(selectedState);
    
    // Auto-load sample data for selected state
    if (selectedState && stateSamples[selectedState]) {
      loadStateSample(selectedState);
    }
  });
  
  // Also update when district changes
  districtSelect.addEventListener('change', (e) => {
    const selectedState = stateSelect.value;
    if (selectedState && stateSamples[selectedState]) {
      // Update district in sample to match selection
      const sample = stateSamples[selectedState];
      sample.district = e.target.value || sample.district;
    }
  });
});

function getDistrictCoords(district) {
  const key = district.toLowerCase().trim();
  return districtCoords[key] || INDIA_CENTER;
}

function getMarkerColor(band) {
  const colors = {
    'LOW': '#3fc1c9',
    'MODERATE': '#ffc107',
    'HIGH': '#f45b69',
    'SEVERE': '#ff5722'
  };
  return colors[band?.toUpperCase()] || '#3fc1c9';
}

function addMarkerToMap(assessment) {
  const coords = getDistrictCoords(assessment.district || 'Unknown');
  const color = getMarkerColor(assessment.band);
  
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  const marker = L.marker(coords, { icon: customIcon }).addTo(map);
  
  const popupContent = `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 0.5rem; color: #04121d;">${assessment.district}, ${assessment.state}</h3>
      <div style="margin: 0.5rem 0;">
        <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; background: ${color}; color: white; font-weight: 600; font-size: 0.85rem;">
          ${assessment.band} RISK
        </span>
      </div>
      <p style="margin: 0.5rem 0; color: #333;"><strong>Score:</strong> ${assessment.score?.toFixed(2) || 'N/A'}</p>
      <p style="margin: 0.5rem 0; color: #333;"><strong>Confidence:</strong> ${assessment.confidence?.toFixed(1) || 'N/A'}%</p>
      <p style="margin: 0; color: #666; font-size: 0.85rem;">${new Date(assessment.timestamp).toLocaleString()}</p>
    </div>
  `;
  
  marker.bindPopup(popupContent);
  markers.push(marker);
  
  // Pan to marker if it's a new assessment
  map.setView(coords, 8, { animate: true });
}

function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

function createFeatureControl(name) {
  const wrapper = document.createElement('div');
  wrapper.className = 'feature-control';

  const header = document.createElement('header');
  const label = document.createElement('strong');
  label.textContent = name;
  const value = document.createElement('span');
  value.className = 'value-pill';
  value.id = `${name}-value`;
  value.textContent = `${featureDefaults[name]} / 100`;
  header.append(label, value);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = name;
  input.name = name;
  input.min = '0';
  input.max = '100';
  input.value = featureDefaults[name];
  input.addEventListener('input', () => {
    value.textContent = `${input.value} / 100`;
  });

  wrapper.append(header, input);
  return wrapper;
}

function populateFeatures() {
  FEATURES.forEach((feature) => featureControls.appendChild(createFeatureControl(feature)));
}

function loadStateSample(state) {
  const sample = stateSamples[state];
  if (!sample) {
    console.warn(`No sample data for state: ${state}`);
    return;
  }
  
  // Set state dropdown
  const stateSelect = document.getElementById('state');
  stateSelect.value = state;
  
  // Populate and set district
  populateDistrictDropdown(state);
  const districtSelect = document.getElementById('district');
  districtSelect.value = sample.district;
  
  // Apply all feature values from sample
  FEATURES.forEach((feature) => {
    const slider = document.getElementById(feature);
    if (!slider) return;
    
    const value = sample[feature] ?? featureDefaults[feature];
    slider.value = value;
    document.getElementById(`${feature}-value`).textContent = `${value} / 100`;
  });
}

function loadSample() {
  // Load Maharashtra sample by default
  loadStateSample('Maharashtra');
}

function bandClass(band) {
  if (!band) return 'low';
  return band.toLowerCase();
}

function renderResults(data) {
  const { risk, actions } = data;
  heroSummary.innerHTML = `
    <h2>${risk.district}, ${risk.state}</h2>
    <div class="risk-pill ${bandClass(risk.band)}">${risk.band} RISK</div>
    <div class="score-area">
      <div class="score-card">
        <div class="score-value">${(risk.score * 100).toFixed(1)}</div>
        <div class="score-label">Risk Score (0-100)</div>
      </div>
      <div class="score-card">
        <div class="score-value">${risk.confidence}%</div>
        <div class="score-label">Confidence</div>
      </div>
    </div>
    <p class="muted">Assessed: ${new Date(risk.timestamp).toLocaleString('en-IN')}</p>
  `;

  riskSummary.innerHTML = `
    <div class="risk-band-display">
      <div class="risk-pill ${bandClass(risk.band)}">${risk.band}</div>
      <div class="risk-meter">
        <div class="risk-meter-fill ${bandClass(risk.band)}" style="width: ${risk.score * 100}%"></div>
      </div>
    </div>
    <div class="grid-two">
      <div class="metric">
        <span>${(risk.score * 100).toFixed(2)}</span>
        Risk Score
      </div>
      <div class="metric">
        <span>${risk.confidence}%</span>
        Model Confidence
      </div>
    </div>
  `;

  if (risk.drivers && risk.drivers.length) {
    driversContainer.innerHTML = '<h3>Top drivers</h3>';
    const list = document.createElement('ul');
    list.className = 'driver-list';
    risk.drivers.forEach((driver) => {
      const item = document.createElement('li');
      item.innerHTML = `
        <strong>${driver.feature}</strong>
        <p>Score ${driver.score} • Impact ${driver.impact}</p>
      `;
      list.appendChild(item);
    });
    driversContainer.appendChild(list);
  } else {
    driversContainer.innerHTML = '';
  }

  actionsContainer.innerHTML = '<h3>Recommended actions</h3>';
  const actionList = document.createElement('ul');
  actionList.className = 'action-list';
  Object.entries(actions).forEach(([agency, details]) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${agency}</strong><p>${details}</p>`;
    actionList.appendChild(item);
  });
  actionsContainer.appendChild(actionList);
  
  // Add marker to map for current assessment
  addMarkerToMap({
    district: risk.district,
    state: risk.state,
    band: risk.band,
    score: risk.score,
    confidence: risk.confidence,
    timestamp: risk.timestamp
  });
}

function renderHistory(items) {
  if (!items || !items.length) {
    historyContainer.innerHTML = '<p class="muted">No prior assessments recorded in this session.</p>';
    return;
  }
  historyContainer.innerHTML = '<h3>Recent assessments</h3>';
  const list = document.createElement('ul');
  list.className = 'history-list';
  
  // Clear existing markers and re-add all from history
  clearMarkers();
  
  items.forEach((item) => {
    const row = document.createElement('li');
    row.innerHTML = `
      <div class="risk-pill ${bandClass(item.band)}">${item.band}</div>
      <strong>${item.district}, ${item.state}</strong>
      <p class="muted">Score ${item.score.toFixed(2)} · Confidence ${item.confidence.toFixed(1)}% · ${new Date(item.timestamp).toLocaleString()}</p>
    `;
    list.appendChild(row);
    
    // Add marker for each history item
    addMarkerToMap(item);
  });
  
  historyContainer.appendChild(list);
  
  // Reset map view to show all markers
  if (items.length > 0) {
    const lastItem = items[0];
    const coords = getDistrictCoords(lastItem.district);
    map.setView(coords, 6, { animate: true });
  }
}

async function loadHistory() {
  try {
    const res = await fetch(HISTORY_URL);
    if (!res.ok) throw new Error('Unable to load history');
    const data = await res.json();
    renderHistory(data.items);
  } catch (error) {
    historyContainer.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

async function submitScenario(event) {
  event.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Assessing…';

  const payload = {
    district: document.getElementById('district').value || 'Unknown',
    state: document.getElementById('state').value || 'Unknown',
    timestamp: new Date().toISOString()
  };

  FEATURES.forEach((feature) => {
    payload[feature] = Number(document.getElementById(feature).value);
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    renderResults(data);
  loadHistory();
  } catch (error) {
    riskSummary.innerHTML = `<p class="muted">${error.message}. Ensure the FastAPI server is running on ${API_URL} and CORS is enabled.</p>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Assess Flood Risk';
  }
}

populateFeatures();
initMap();
form.addEventListener('submit', submitScenario);
sampleBtn.addEventListener('click', (event) => {
  event.preventDefault();
  loadSample();
});

loadSample();
loadHistory();

