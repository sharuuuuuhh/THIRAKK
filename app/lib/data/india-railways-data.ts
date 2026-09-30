/**
 * Pan-India Railway Stations and Trains Seed Dataset.
 * Includes major junction stations across all Indian Railway zones:
 * NR, SR, WR, CR, ER, ECoR, SCR, SWR, NCR, NWR, NER, NFR, SECR, WCR.
 */

export interface StationData {
  code: string
  name: string
  name_ml?: string
  lat: number
  lng: number
  state: string
  zone: string
}

export interface TrainData {
  number: string
  name: string
  name_ml?: string
  route_id: number
  origin_code: string
  dest_code: string
  stops: {
    station_code: string
    arr: string | null
    dep: string | null
    day_offset: number
  }[]
}

export interface RouteData {
  id: number
  name: string
  description: string
  station_codes: string[]
}

export const INDIA_STATIONS: StationData[] = [
  // ── Kerala Stations ──
  { code: 'TVC', name: 'Thiruvananthapuram Central', name_ml: 'തിരുവനന്തപുരം സെൻട്രൽ', lat: 8.4870, lng: 76.9490, state: 'Kerala', zone: 'SR' },
  { code: 'QLN', name: 'Kollam Junction', name_ml: 'കൊല്ലം ജംഗ്ഷൻ', lat: 8.8870, lng: 76.5950, state: 'Kerala', zone: 'SR' },
  { code: 'KYJ', name: 'Kayamkulam Junction', name_ml: 'കായംകുളം ജംഗ്ഷൻ', lat: 9.1720, lng: 76.5000, state: 'Kerala', zone: 'SR' },
  { code: 'CNGR', name: 'Chengannur', name_ml: 'ചെങ്ങന്നൂർ', lat: 9.3170, lng: 76.6180, state: 'Kerala', zone: 'SR' },
  { code: 'TRVL', name: 'Tiruvalla', name_ml: 'തിരുവല്ല', lat: 9.3830, lng: 76.5750, state: 'Kerala', zone: 'SR' },
  { code: 'KTYM', name: 'Kottayam', name_ml: 'കോട്ടയം', lat: 9.5910, lng: 76.5320, state: 'Kerala', zone: 'SR' },
  { code: 'ALLP', name: 'Alappuzha', name_ml: 'ആലപ്പുഴ', lat: 9.4900, lng: 76.3260, state: 'Kerala', zone: 'SR' },
  { code: 'ERS', name: 'Ernakulam Junction (South)', name_ml: 'എറണാകുളം ജംഗ്ഷൻ', lat: 9.9690, lng: 76.2910, state: 'Kerala', zone: 'SR' },
  { code: 'ERN', name: 'Ernakulam Town (North)', name_ml: 'എറണാകുളം ടൗൺ', lat: 9.9920, lng: 76.2880, state: 'Kerala', zone: 'SR' },
  { code: 'AWY', name: 'Aluva', name_ml: 'ആലുവ', lat: 10.1080, lng: 76.3560, state: 'Kerala', zone: 'SR' },
  { code: 'AFK', name: 'Angamaly', name_ml: 'അങ്കമാലി', lat: 10.1840, lng: 76.3780, state: 'Kerala', zone: 'SR' },
  { code: 'CKI', name: 'Chalakudy', name_ml: 'ചാലക്കുടി', lat: 10.3020, lng: 76.3220, state: 'Kerala', zone: 'SR' },
  { code: 'IJK', name: 'Irinjalakuda', name_ml: 'ഇരിഞ്ഞാലക്കുട', lat: 10.3406, lng: 76.2809, state: 'Kerala', zone: 'SR' },
  { code: 'TCR', name: 'Thrissur', name_ml: 'തൃശ്ശൂർ', lat: 10.5150, lng: 76.2080, state: 'Kerala', zone: 'SR' },
  { code: 'SRR', name: 'Shoranur Junction', name_ml: 'ഷൊർണൂർ ജംഗ്ഷൻ', lat: 10.7600, lng: 76.2700, state: 'Kerala', zone: 'SR' },
  { code: 'PGT', name: 'Palakkad Junction', name_ml: 'പാലക്കാട് ജംഗ്ഷൻ', lat: 10.7867, lng: 76.6548, state: 'Kerala', zone: 'SR' },
  { code: 'TIR', name: 'Tirur', name_ml: 'തിരൂർ', lat: 10.9160, lng: 75.9230, state: 'Kerala', zone: 'SR' },
  { code: 'FK', name: 'Feroke', name_ml: 'ഫറോക്ക്', lat: 11.1759, lng: 75.8302, state: 'Kerala', zone: 'SR' },
  { code: 'CLT', name: 'Kozhikode', name_ml: 'കോഴിക്കോട്', lat: 11.2465, lng: 75.7805, state: 'Kerala', zone: 'SR' },
  { code: 'QLD', name: 'Koyilandy', name_ml: 'കൊയിലാണ്ടി', lat: 11.4459, lng: 75.6937, state: 'Kerala', zone: 'SR' },
  { code: 'BDJ', name: 'Vadakara', name_ml: 'വടകര', lat: 11.5930, lng: 75.5870, state: 'Kerala', zone: 'SR' },
  { code: 'MAHE', name: 'Mahe', name_ml: 'മാഹി', lat: 11.6990, lng: 75.5466, state: 'Puducherry', zone: 'SR' },
  { code: 'TLY', name: 'Thalassery', name_ml: 'തലശ്ശേരി', lat: 11.7520, lng: 75.4940, state: 'Kerala', zone: 'SR' },
  { code: 'CAN', name: 'Kannur', name_ml: 'കണ്ണൂർ', lat: 11.8689, lng: 75.3555, state: 'Kerala', zone: 'SR' },
  { code: 'PAY', name: 'Payyanur', name_ml: 'പയ്യന്നൂർ', lat: 12.1000, lng: 75.2000, state: 'Kerala', zone: 'SR' },
  { code: 'KGQ', name: 'Kasaragod', name_ml: 'കാസർഗോഡ്', lat: 12.5000, lng: 74.9800, state: 'Kerala', zone: 'SR' },

  // ── Karnataka / Konkan ──
  { code: 'MAQ', name: 'Mangaluru Central', lat: 12.8620, lng: 74.8420, state: 'Karnataka', zone: 'SR' },
  { code: 'MAJN', name: 'Mangaluru Junction', lat: 12.8710, lng: 74.8760, state: 'Karnataka', zone: 'SR' },
  { code: 'UD', name: 'Udupi', lat: 13.3409, lng: 74.7421, state: 'Karnataka', zone: 'KR' },
  { code: 'KAWR', name: 'Karwar', lat: 14.8180, lng: 74.1300, state: 'Karnataka', zone: 'KR' },
  { code: 'MAO', name: 'Madgaon Junction (Goa)', lat: 15.2736, lng: 73.9780, state: 'Goa', zone: 'KR' },
  { code: 'KRMI', name: 'Karmali (Goa)', lat: 15.4960, lng: 73.9180, state: 'Goa', zone: 'KR' },
  { code: 'RN', name: 'Ratnagiri', lat: 16.9800, lng: 73.3300, state: 'Maharashtra', zone: 'KR' },
  { code: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lng: 77.5684, state: 'Karnataka', zone: 'SWR' },
  { code: 'YPR', name: 'Yesvantpur Junction', lat: 13.0234, lng: 77.5504, state: 'Karnataka', zone: 'SWR' },
  { code: 'MYS', name: 'Mysuru Junction', lat: 12.3160, lng: 76.6490, state: 'Karnataka', zone: 'SWR' },
  { code: 'UBL', name: 'SSS Hubballi Junction', lat: 15.3480, lng: 75.1480, state: 'Karnataka', zone: 'SWR' },

  // ── Tamil Nadu ──
  { code: 'MAS', name: 'MGR Chennai Central', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'MS', name: 'Chennai Egmore', lat: 13.0784, lng: 80.2608, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'CBE', name: 'Coimbatore Junction', lat: 11.0000, lng: 76.9600, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'ED', name: 'Erode Junction', lat: 11.3400, lng: 77.7200, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'SA', name: 'Salem Junction', lat: 11.6643, lng: 78.1460, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'TPJ', name: 'Tiruchchirappalli Junction', lat: 10.7905, lng: 78.6900, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'MDU', name: 'Madurai Junction', lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'CAPE', name: 'Kanniyakumari', lat: 8.0883, lng: 77.5385, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'NCJ', name: 'Nagercoil Junction', lat: 8.1800, lng: 77.4300, state: 'Tamil Nadu', zone: 'SR' },
  { code: 'KPD', name: 'Katpadi Junction', lat: 12.9698, lng: 79.1360, state: 'Tamil Nadu', zone: 'SR' },

  // ── Andhra Pradesh & Telangana ──
  { code: 'SC', name: 'Secunderabad Junction', lat: 17.4340, lng: 78.5000, state: 'Telangana', zone: 'SCR' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', lat: 17.3920, lng: 78.4680, state: 'Telangana', zone: 'SCR' },
  { code: 'BZA', name: 'Vijayawada Junction', lat: 16.5180, lng: 80.6190, state: 'Andhra Pradesh', zone: 'SCR' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', lat: 17.7215, lng: 83.2885, state: 'Andhra Pradesh', zone: 'ECoR' },
  { code: 'RU', name: 'Renigunta Junction', lat: 13.6500, lng: 79.5200, state: 'Andhra Pradesh', zone: 'SCR' },
  { code: 'TPTY', name: 'Tirupati', lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', zone: 'SCR' },

  // ── Maharashtra & Gujarat (Western & Central) ──
  { code: 'CSMT', name: 'Mumbai CSMT', lat: 18.9400, lng: 72.8350, state: 'Maharashtra', zone: 'CR' },
  { code: 'MMCT', name: 'Mumbai Central', lat: 18.9696, lng: 72.8193, state: 'Maharashtra', zone: 'WR' },
  { code: 'BDTS', name: 'Bandra Terminus', lat: 19.0560, lng: 72.8420, state: 'Maharashtra', zone: 'WR' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus (Kurla)', lat: 19.0688, lng: 72.8906, state: 'Maharashtra', zone: 'CR' },
  { code: 'PNVL', name: 'Panvel Junction', lat: 18.9890, lng: 73.1230, state: 'Maharashtra', zone: 'CR' },
  { code: 'PUNE', name: 'Pune Junction', lat: 18.5284, lng: 73.8744, state: 'Maharashtra', zone: 'CR' },
  { code: 'NGP', name: 'Nagpur Junction', lat: 21.1520, lng: 79.0880, state: 'Maharashtra', zone: 'CR' },
  { code: 'BSL', name: 'Bhusaval Junction', lat: 21.0500, lng: 75.7800, state: 'Maharashtra', zone: 'CR' },
  { code: 'ADI', name: 'Ahmedabad Junction', lat: 23.0225, lng: 72.6000, state: 'Gujarat', zone: 'WR' },
  { code: 'BRC', name: 'Vadodara Junction', lat: 22.3100, lng: 73.1800, state: 'Gujarat', zone: 'WR' },
  { code: 'ST', name: 'Surat', lat: 21.2050, lng: 72.8400, state: 'Gujarat', zone: 'WR' },

  // ── Delhi NCR & Northern India ──
  { code: 'NDLS', name: 'New Delhi', lat: 28.6420, lng: 77.2200, state: 'Delhi', zone: 'NR' },
  { code: 'DLI', name: 'Old Delhi Junction', lat: 28.6600, lng: 77.2300, state: 'Delhi', zone: 'NR' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', lat: 28.5890, lng: 77.2530, state: 'Delhi', zone: 'NR' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', lat: 28.6480, lng: 77.3150, state: 'Delhi', zone: 'NR' },
  { code: 'AGC', name: 'Agra Cantt', lat: 27.1580, lng: 77.9890, state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'GWL', name: 'Gwalior Junction', lat: 26.2167, lng: 78.1833, state: 'Madhya Pradesh', zone: 'NCR' },
  { code: 'JHS', name: 'VGL Jhansi Junction', lat: 25.4484, lng: 78.5685, state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'BPL', name: 'Bhopal Junction', lat: 23.2600, lng: 77.4100, state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'ET', name: 'Itarsi Junction', lat: 22.6100, lng: 77.7600, state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'JBP', name: 'Jabalpur Junction', lat: 23.1600, lng: 79.9500, state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'JP', name: 'Jaipur Junction', lat: 26.9200, lng: 75.7870, state: 'Rajasthan', zone: 'NWR' },
  { code: 'JU', name: 'Jodhpur Junction', lat: 26.2800, lng: 73.0200, state: 'Rajasthan', zone: 'NWR' },
  { code: 'ASR', name: 'Amritsar Junction', lat: 31.6340, lng: 74.8723, state: 'Punjab', zone: 'NR' },
  { code: 'CDG', name: 'Chandigarh Junction', lat: 30.7050, lng: 76.8200, state: 'Chandigarh', zone: 'NR' },
  { code: 'JAT', name: 'Jammu Tawi', lat: 32.7060, lng: 74.8800, state: 'Jammu and Kashmir', zone: 'NR' },

  // ── Uttar Pradesh & Bihar ──
  { code: 'LKO', name: 'Lucknow Charbagh', lat: 26.8320, lng: 80.9220, state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'CNB', name: 'Kanpur Central', lat: 26.4540, lng: 80.3500, state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'PRYJ', name: 'Prayagraj Junction (Allahabad)', lat: 25.4450, lng: 81.8280, state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'BSB', name: 'Varanasi Junction', lat: 25.3280, lng: 82.9860, state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction (Mughalsarai)', lat: 25.2790, lng: 83.1180, state: 'Uttar Pradesh', zone: 'ECR' },
  { code: 'PNBE', name: 'Patna Junction', lat: 25.6020, lng: 85.1376, state: 'Bihar', zone: 'ECR' },
  { code: 'GKP', name: 'Gorakhpur Junction', lat: 26.7588, lng: 83.3820, state: 'Uttar Pradesh', zone: 'NER' },

  // ── Eastern & North Eastern India ──
  { code: 'HWH', name: 'Howrah Junction (Kolkata)', lat: 22.5830, lng: 88.3420, state: 'West Bengal', zone: 'ER' },
  { code: 'SDAH', name: 'Sealdah (Kolkata)', lat: 22.5697, lng: 88.3713, state: 'West Bengal', zone: 'ER' },
  { code: 'KGP', name: 'Kharagpur Junction', lat: 22.3300, lng: 87.3200, state: 'West Bengal', zone: 'SER' },
  { code: 'BBS', name: 'Bhubaneswar', lat: 20.2668, lng: 85.8436, state: 'Odisha', zone: 'ECoR' },
  { code: 'PURI', name: 'Puri', lat: 19.8130, lng: 85.8310, state: 'Odisha', zone: 'ECoR' },
  { code: 'GHY', name: 'Guwahati', lat: 26.1800, lng: 91.7500, state: 'Assam', zone: 'NFR' },
  { code: 'R', name: 'Raipur Junction', lat: 21.2570, lng: 81.6290, state: 'Chhattisgarh', zone: 'SECR' },
]

export const INDIA_ROUTES: RouteData[] = [
  {
    id: 1,
    name: 'Kannur – Kozhikode Corridor',
    description: 'Malabar Coast commuter mainline (Kannur to Kozhikode)',
    station_codes: ['CAN', 'TLY', 'MAHE', 'BDJ', 'QLD', 'FK', 'CLT'],
  },
  {
    id: 2,
    name: 'Thrissur – Ernakulam Corridor',
    description: 'Central Kerala commuter mainline (Thrissur to Ernakulam Jn)',
    station_codes: ['TCR', 'IJK', 'CKI', 'AFK', 'AWY', 'ERS'],
  },
  {
    id: 3,
    name: 'Kerala Grand Mainline (TVC – CAN)',
    description: 'Thiruvananthapuram to Kannur via Kottayam, Ernakulam, Thrissur & Kozhikode',
    station_codes: ['TVC', 'QLN', 'KYJ', 'CNGR', 'KTYM', 'ERN', 'AWY', 'TCR', 'SRR', 'TIR', 'CLT', 'BDJ', 'TLY', 'CAN', 'KGQ', 'MAQ'],
  },
  {
    id: 4,
    name: 'Konkan Coastal Express Route (MAQ – CSMT)',
    description: 'Mangaluru to Mumbai via Udupi, Karwar, Madgaon, Ratnagiri & Panvel',
    station_codes: ['MAQ', 'UD', 'KAWR', 'MAO', 'KRMI', 'RN', 'PNVL', 'CSMT'],
  },
  {
    id: 5,
    name: 'Kerala – Delhi Grand Trunk / Kerala Express (TVC – NDLS)',
    description: 'Thiruvananthapuram to New Delhi via Coimbatore, Vijayawada, Nagpur, Bhopal & Agra',
    station_codes: ['TVC', 'QLN', 'KTYM', 'ERS', 'TCR', 'PGT', 'CBE', 'ED', 'SA', 'KPD', 'RU', 'BZA', 'NGP', 'BPL', 'JHS', 'AGC', 'NDLS'],
  },
  {
    id: 6,
    name: 'Chennai – Bengaluru – Mysuru Corridor',
    description: 'MGR Chennai Central to Mysuru via Katpadi and Bengaluru',
    station_codes: ['MAS', 'KPD', 'SBC', 'MYS'],
  },
  {
    id: 7,
    name: 'Mumbai – Ahmedabad Western Trunk (MMCT – ADI)',
    description: 'Mumbai to Ahmedabad via Surat and Vadodara',
    station_codes: ['MMCT', 'ST', 'BRC', 'ADI'],
  },
  {
    id: 8,
    name: 'Delhi – Kolkata Eastern Mainline (NDLS – HWH)',
    description: 'New Delhi to Howrah via Kanpur, Prayagraj, Pt. Deen Dayal Upadhyaya & Patna',
    station_codes: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'HWH'],
  },
  {
    id: 9,
    name: 'Chennai – Hyderabad Corridor (MAS – HYB)',
    description: 'Chennai to Hyderabad/Secunderabad via Vijayawada',
    station_codes: ['MAS', 'BZA', 'SC', 'HYB'],
  },
  {
    id: 10,
    name: 'Howrah – Chennai East Coast Trunk (HWH – MAS)',
    description: 'Kolkata to Chennai via Kharagpur, Bhubaneswar, and Visakhapatnam',
    station_codes: ['HWH', 'KGP', 'BBS', 'VSKP', 'BZA', 'MAS'],
  },
]

export const INDIA_TRAINS: TrainData[] = [
  // Corridor 1 & 2 Local/Intercity Trains
  {
    number: '56640',
    name: 'Kannur–Kozhikode Passenger',
    name_ml: 'കണ്ണൂർ–കോഴിക്കോട് പാസഞ്ചർ',
    route_id: 1,
    origin_code: 'CAN',
    dest_code: 'CLT',
    stops: [
      { station_code: 'CAN', arr: null, dep: '06:30', day_offset: 0 },
      { station_code: 'TLY', arr: '06:52', dep: '06:54', day_offset: 0 },
      { station_code: 'MAHE', arr: '07:05', dep: '07:06', day_offset: 0 },
      { station_code: 'BDJ', arr: '07:20', dep: '07:22', day_offset: 0 },
      { station_code: 'QLD', arr: '07:44', dep: '07:45', day_offset: 0 },
      { station_code: 'FK', arr: '08:08', dep: '08:09', day_offset: 0 },
      { station_code: 'CLT', arr: '08:25', dep: null, day_offset: 0 },
    ],
  },
  {
    number: '16629',
    name: 'Malabar Express',
    name_ml: 'മലബാർ എക്‌സ്പ്രസ്',
    route_id: 3,
    origin_code: 'TVC',
    dest_code: 'MAQ',
    stops: [
      { station_code: 'TVC', arr: null, dep: '18:40', day_offset: 0 },
      { station_code: 'QLN', arr: '19:32', dep: '19:35', day_offset: 0 },
      { station_code: 'KYJ', arr: '20:18', dep: '20:20', day_offset: 0 },
      { station_code: 'CNGR', arr: '20:41', dep: '20:43', day_offset: 0 },
      { station_code: 'KTYM', arr: '21:32', dep: '21:35', day_offset: 0 },
      { station_code: 'ERN', arr: '22:50', dep: '22:55', day_offset: 0 },
      { station_code: 'AWY', arr: '23:18', dep: '23:20', day_offset: 0 },
      { station_code: 'TCR', arr: '00:10', dep: '00:13', day_offset: 1 },
      { station_code: 'SRR', arr: '01:00', dep: '01:05', day_offset: 1 },
      { station_code: 'TIR', arr: '01:43', dep: '01:45', day_offset: 1 },
      { station_code: 'CLT', arr: '02:37', dep: '02:40', day_offset: 1 },
      { station_code: 'BDJ', arr: '03:19', dep: '03:20', day_offset: 1 },
      { station_code: 'TLY', arr: '03:39', dep: '03:40', day_offset: 1 },
      { station_code: 'CAN', arr: '04:12', dep: '04:15', day_offset: 1 },
      { station_code: 'KGQ', arr: '05:33', dep: '05:35', day_offset: 1 },
      { station_code: 'MAQ', arr: '06:40', dep: null, day_offset: 1 },
    ],
  },
  {
    number: '20631',
    name: 'Kasaragod–TVC Vande Bharat Express',
    name_ml: 'കാസർഗോഡ്–തിരുവനന്തപുരം വന്ദേ ഭാരത്',
    route_id: 3,
    origin_code: 'KGQ',
    dest_code: 'TVC',
    stops: [
      { station_code: 'KGQ', arr: null, dep: '07:00', day_offset: 0 },
      { station_code: 'CAN', arr: '07:55', dep: '07:57', day_offset: 0 },
      { station_code: 'CLT', arr: '08:57', dep: '08:59', day_offset: 0 },
      { station_code: 'TIR', arr: '09:22', dep: '09:24', day_offset: 0 },
      { station_code: 'SRR', arr: '09:58', dep: '10:00', day_offset: 0 },
      { station_code: 'TCR', arr: '10:38', dep: '10:40', day_offset: 0 },
      { station_code: 'ERN', arr: '11:45', dep: '11:48', day_offset: 0 },
      { station_code: 'KTYM', arr: '12:38', dep: '12:40', day_offset: 0 },
      { station_code: 'QLN', arr: '13:58', dep: '14:00', day_offset: 0 },
      { station_code: 'TVC', arr: '15:05', dep: null, day_offset: 0 },
    ],
  },
  {
    number: '12625',
    name: 'Kerala Express (TVC – NDLS)',
    name_ml: 'കേരള എക്സ്പ്രസ്',
    route_id: 5,
    origin_code: 'TVC',
    dest_code: 'NDLS',
    stops: [
      { station_code: 'TVC', arr: null, dep: '12:30', day_offset: 0 },
      { station_code: 'QLN', arr: '13:30', dep: '13:33', day_offset: 0 },
      { station_code: 'KTYM', arr: '15:25', dep: '15:28', day_offset: 0 },
      { station_code: 'ERS', arr: '16:40', dep: '16:45', day_offset: 0 },
      { station_code: 'TCR', arr: '17:48', dep: '17:50', day_offset: 0 },
      { station_code: 'PGT', arr: '19:12', dep: '19:15', day_offset: 0 },
      { station_code: 'CBE', arr: '20:32', dep: '20:35', day_offset: 0 },
      { station_code: 'ED', arr: '21:55', dep: '22:00', day_offset: 0 },
      { station_code: 'SA', arr: '22:52', dep: '22:55', day_offset: 0 },
      { station_code: 'KPD', arr: '01:50', dep: '01:55', day_offset: 1 },
      { station_code: 'RU', arr: '04:10', dep: '04:15', day_offset: 1 },
      { station_code: 'BZA', arr: '09:40', dep: '09:50', day_offset: 1 },
      { station_code: 'NGP', arr: '18:40', dep: '18:45', day_offset: 1 },
      { station_code: 'BPL', arr: '00:50', dep: '00:55', day_offset: 2 },
      { station_code: 'JHS', arr: '04:45', dep: '04:50', day_offset: 2 },
      { station_code: 'AGC', arr: '07:30', dep: '07:35', day_offset: 2 },
      { station_code: 'NDLS', arr: '13:40', dep: null, day_offset: 2 },
    ],
  },
  {
    number: '12617',
    name: 'Mangala Lakshadweep Express',
    name_ml: 'മംഗള ലക്ഷദ്വീപ് എക്സ്പ്രസ്',
    route_id: 4,
    origin_code: 'ERS',
    dest_code: 'NZM',
    stops: [
      { station_code: 'ERS', arr: null, dep: '10:30', day_offset: 0 },
      { station_code: 'TCR', arr: '11:40', dep: '11:43', day_offset: 0 },
      { station_code: 'CLT', arr: '13:52', dep: '13:55', day_offset: 0 },
      { station_code: 'CAN', arr: '15:17', dep: '15:20', day_offset: 0 },
      { station_code: 'MAQ', arr: '17:35', dep: '17:45', day_offset: 0 },
      { station_code: 'UD', arr: '18:42', dep: '18:44', day_offset: 0 },
      { station_code: 'KAWR', arr: '21:30', dep: '21:32', day_offset: 0 },
      { station_code: 'MAO', arr: '22:50', dep: '23:00', day_offset: 0 },
      { station_code: 'RN', arr: '03:15', dep: '03:20', day_offset: 1 },
      { station_code: 'PNVL', arr: '08:30', dep: '08:35', day_offset: 1 },
      { station_code: 'CSMT', arr: '10:00', dep: null, day_offset: 1 },
    ],
  },
  {
    number: '12007',
    name: 'Chennai–Mysuru Shatabdi Express',
    name_ml: 'ചെന്നൈ–മൈസൂരു ശതാബ്ദി',
    route_id: 6,
    origin_code: 'MAS',
    dest_code: 'MYS',
    stops: [
      { station_code: 'MAS', arr: null, dep: '06:00', day_offset: 0 },
      { station_code: 'KPD', arr: '07:38', dep: '07:40', day_offset: 0 },
      { station_code: 'SBC', arr: '10:45', dep: '10:50', day_offset: 0 },
      { station_code: 'MYS', arr: '13:00', dep: null, day_offset: 0 },
    ],
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani Express (MMCT – NDLS)',
    route_id: 7,
    origin_code: 'MMCT',
    dest_code: 'NDLS',
    stops: [
      { station_code: 'MMCT', arr: null, dep: '17:00', day_offset: 0 },
      { station_code: 'ST', arr: '19:43', dep: '19:48', day_offset: 0 },
      { station_code: 'BRC', arr: '21:06', dep: '21:16', day_offset: 0 },
      { station_code: 'NDLS', arr: '08:32', dep: null, day_offset: 1 },
    ],
  },
  {
    number: '12301',
    name: 'Howrah Rajdhani Express (HWH – NDLS)',
    route_id: 8,
    origin_code: 'HWH',
    dest_code: 'NDLS',
    stops: [
      { station_code: 'HWH', arr: null, dep: '16:50', day_offset: 0 },
      { station_code: 'DDU', arr: '00:45', dep: '00:55', day_offset: 1 },
      { station_code: 'PRYJ', arr: '02:43', dep: '02:45', day_offset: 1 },
      { station_code: 'CNB', arr: '04:40', dep: '04:45', day_offset: 1 },
      { station_code: 'NDLS', arr: '10:05', dep: null, day_offset: 1 },
    ],
  },
  {
    number: '12760',
    name: 'Charminar Express (HYB – MAS)',
    route_id: 9,
    origin_code: 'HYB',
    dest_code: 'MAS',
    stops: [
      { station_code: 'HYB', arr: null, dep: '18:00', day_offset: 0 },
      { station_code: 'SC', arr: '18:20', dep: '18:25', day_offset: 0 },
      { station_code: 'BZA', arr: '23:45', dep: '23:55', day_offset: 0 },
      { station_code: 'MAS', arr: '07:00', dep: null, day_offset: 1 },
    ],
  },
  {
    number: '12841',
    name: 'Coromandel Express (HWH – MAS)',
    route_id: 10,
    origin_code: 'HWH',
    dest_code: 'MAS',
    stops: [
      { station_code: 'HWH', arr: null, dep: '15:20', day_offset: 0 },
      { station_code: 'KGP', arr: '16:55', dep: '17:00', day_offset: 0 },
      { station_code: 'BBS', arr: '21:40', dep: '21:45', day_offset: 0 },
      { station_code: 'VSKP', arr: '04:25', dep: '04:45', day_offset: 1 },
      { station_code: 'BZA', arr: '10:05', dep: '10:15', day_offset: 1 },
      { station_code: 'MAS', arr: '17:00', dep: null, day_offset: 1 },
    ],
  },
]
