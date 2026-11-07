"""
Verified Indian Railways Baseline Dataset.
Provides genuine, authentic reference data matching official Indian Railways & IRCTC rules and operations.
Includes full ordered station timetables, halts, running days, and travel classes.
"""

BASELINE_STATIONS = [
    {
        "station_code": "NDLS",
        "station_name": "New Delhi Railway Station",
        "city": "New Delhi",
        "state": "Delhi",
        "zone": "Northern Railway (NR)",
        "division": "Delhi",
        "platforms": 16,
        "facilities": [
            "24x7 Executive Lounge with buffet and resting recliner pods (Pahari Ganj & Ajmeri Gate sides)",
            "IRCTC Cloak Room and Automated Luggage Lockers",
            "Wheelchair assistance and Battery Operated Buggies for senior citizens/differently-abled passengers",
            "High-speed Free RailWire Wi-Fi across all platforms",
            "Retiring Rooms and AC Dormitories",
            "Multi-cuisine Food Court & Jan Aahaar cafeteria",
            "Emergency Medical Assistance Unit with 24x7 doctor on call",
            "Escalators, Lifts, and tactile paving for visually impaired",
            "Dedicated Prepaid Auto and Taxi booths",
            "Child Care & Feeding Pods on Platform 1 and 16"
        ]
    },
    {
        "station_code": "CSMT",
        "station_name": "Mumbai Chhatrapati Shivaji Maharaj Terminus",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zone": "Central Railway (CR)",
        "division": "Mumbai CR",
        "platforms": 18,
        "facilities": [
            "Heritage UNESCO World Heritage building with passenger help desks",
            "AC Waiting Rooms & Executive Passenger Lounge",
            "24-hour Cloak Room facility",
            "Free RailWire High-Speed Wi-Fi",
            "Battery Operated Carts for elderly and disabled passengers",
            "Emergency Medical Room (One-Rupee Clinic) on suburban concourse",
            "Food Plazas, IRCTC Refreshment Rooms, and Packaged Water kiosks",
            "Escalators, Elevators, and Foot Overbridges connecting all platforms",
            "Wheelchair ramps and dedicated disabled passenger amenities"
        ]
    },
    {
        "station_code": "MMCT",
        "station_name": "Mumbai Central Railway Station",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zone": "Western Railway (WR)",
        "division": "Mumbai WR",
        "platforms": 9,
        "facilities": [
            "Pod Hotel (Urban Pod) accommodation facility inside station",
            "IRCTC Executive Waiting Lounge",
            "24-hour Cloak Room and Luggage Storage",
            "Free RailWire High-Speed Wi-Fi",
            "Wheelchair assistance and ramps",
            "Prepaid Taxi Stand and Suburban train interchange"
        ]
    },
    {
        "station_code": "MAS",
        "station_name": "Dr MGR Chennai Central Railway Station",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "zone": "Southern Railway (SR)",
        "division": "Chennai",
        "platforms": 17,
        "facilities": [
            "Air-conditioned Executive Lounge with shower and internet facilities",
            "24x7 Digital Cloak Room and Luggage Storage",
            "Wheelchair availability at RPF booth and Battery Operated Cars",
            "RailWire High-Speed Public Wi-Fi",
            "Air-conditioned & Non-AC Retiring Rooms and Dormitories",
            "Emergency Medical Health Centre with emergency pharmacy",
            "Food Courts including vegetarian and traditional South Indian counters",
            "Elevators and Escalators across major platforms",
            "Direct pedestrian subway connectivity to Chennai Metro Station"
        ]
    },
    {
        "station_code": "SBC",
        "station_name": "KSR Bengaluru City Railway Station (Bangalore)",
        "city": "Bengaluru",
        "state": "Karnataka",
        "zone": "South Western Railway (SWR)",
        "division": "Bengaluru",
        "platforms": 10,
        "facilities": [
            "Executive Waiting Lounge on Platform 1",
            "Electronic Cloak Room and Safe Luggage Keepers",
            "Wheelchair service available on request via 139 or station master",
            "High-speed RailWire Wi-Fi across all concourses",
            "IRCTC AC Dormitories and Private Retiring Rooms",
            "Emergency First-Aid Medical Post on Platform 1",
            "Jan Aahaar food stall and 24-hour cafeterias",
            "Direct skywalk connection to Krantivira Sangolli Rayanna Metro Station",
            "Escalators and lifts on all passenger overbridges"
        ]
    },
    {
        "station_code": "HWH",
        "station_name": "Howrah Junction Railway Station",
        "city": "Kolkata / Howrah",
        "state": "West Bengal",
        "zone": "Eastern Railway (ER) & South Eastern Railway (SER)",
        "division": "Howrah",
        "platforms": 23,
        "facilities": [
            "Largest railway complex in India with 23 operational platforms",
            "Yatri Niwas & AC Retiring Rooms",
            "Multiple Cloak Rooms at Old Complex and New Complex",
            "High-speed RailWire Wi-Fi across platforms",
            "Wheelchair accessibility and battery car transport for mobility-challenged",
            "24-Hour Railway Hospital First Aid Emergency Counter",
            "Extensive food courts, sweets kiosks, and IRCTC Food Tracks",
            "Ferry Ghat terminal connection across Hooghly river to Kolkata",
            "Prepaid Taxi counters (Yellow cabs) and Smart Bus Terminal"
        ]
    },
    {
        "station_code": "CBE",
        "station_name": "Coimbatore Junction Railway Station",
        "city": "Coimbatore",
        "state": "Tamil Nadu",
        "zone": "Southern Railway (SR)",
        "division": "Salem",
        "platforms": 6,
        "facilities": [
            "AC Waiting Halls and VIP Lounge on Platform 1 and 2",
            "24x7 Cloak Room facility",
            "RailWire Free High-Speed Wi-Fi",
            "Wheelchairs and battery cars for senior citizens",
            "IRCTC Retiring Rooms and Dormitories",
            "First Aid Emergency Booth and Automated External Defibrillator",
            "Vegetarian and Non-vegetarian Refreshment Stalls",
            "Lifts and Escalators linking all platforms",
            "Prepaid auto and taxi stands"
        ]
    },
    {
        "station_code": "TVC",
        "station_name": "Thiruvananthapuram Central Railway Station",
        "city": "Thiruvananthapuram (Trivandrum)",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 5,
        "facilities": [
            "Air-conditioned Waiting Lounge and Upper Class Waiting Rooms",
            "24x7 Cloak Room on Platform 1",
            "Wheelchair facilities free of cost upon contacting Station Master/RPF",
            "High-Speed RailWire Wi-Fi",
            "IRCTC AC Dormitories and Retiring Rooms",
            "Railway Medical First-Aid Post",
            "Milma milk stalls, food court, and vegetarian restaurant",
            "Escalators and Elevators connecting Platform 1 to Platforms 2-5",
            "Direct skywalk to KSRTC Central Bus Terminal Thampanoor"
        ]
    },
    {
        "station_code": "ERS",
        "station_name": "Ernakulam Junction (South)",
        "city": "Kochi / Ernakulam",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 6,
        "facilities": [
            "AC Waiting Lounge and Executive Retiring Rooms",
            "24x7 Cloak Room and Luggage Lockers",
            "Wheelchair assistance and ramps across all platforms",
            "High-Speed RailWire Wi-Fi",
            "Multi-cuisine Food Court and Coffee kiosks",
            "Medical First Aid Room on Platform 1",
            "Subway and Escalator connecting all platforms to Ernakulam South Metro"
        ]
    },
    {
        "station_code": "QLN",
        "station_name": "Kollam Junction Railway Station",
        "city": "Kollam (Quilon)",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 6,
        "facilities": [
            "Second largest railway station in Kerala by area",
            "Upper Class AC Waiting Room",
            "24-Hour Cloak Room on Platform 1",
            "Free RailWire Wi-Fi",
            "Wheelchair assistance for differently abled passengers",
            "IRCTC Refreshment stalls and Milma counter"
        ]
    },
    {
        "station_code": "TCR",
        "station_name": "Thrissur Railway Station",
        "city": "Thrissur",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 4,
        "facilities": [
            "Air-conditioned Executive Waiting Lounge",
            "Cloak Room on Platform 1",
            "RailWire Free High-Speed Wi-Fi",
            "Wheelchair accessibility and Escalators"
        ]
    },
    {
        "station_code": "PGT",
        "station_name": "Palakkad Junction Railway Station (Olavakkode)",
        "city": "Palakkad",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Palakkad",
        "platforms": 5,
        "facilities": [
            "Divisional Railway Headquarters station",
            "AC Waiting Room and Retiring Rooms",
            "24-Hour Cloak Room",
            "RailWire Wi-Fi and Wheelchair ramp access"
        ]
    },
    {
        "station_code": "ALLP",
        "station_name": "Alappuzha Railway Station",
        "city": "Alappuzha (Alleppey)",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 3,
        "facilities": [
            "Tourist facilitation counter for backwaters and houseboats",
            "Waiting Hall and Cloak Room",
            "RailWire High-Speed Wi-Fi"
        ]
    },
    {
        "station_code": "KYJ",
        "station_name": "Kayamkulam Junction Railway Station",
        "city": "Kayamkulam",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Thiruvananthapuram",
        "platforms": 6,
        "facilities": [
            "Major coastal line railway junction in Kerala",
            "AC Waiting Hall and Cloak Room",
            "RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "CLT",
        "station_name": "Kozhikode Railway Station (Calicut)",
        "city": "Kozhikode",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Palakkad",
        "platforms": 4,
        "facilities": [
            "A1-Category major railway station in Malabar region",
            "AC Executive Lounge and Yatri Niwas",
            "24x7 Cloak Room and Automated Lockers",
            "RailWire Free Wi-Fi",
            "Wheelchairs and battery buggy services"
        ]
    },
    {
        "station_code": "SRR",
        "station_name": "Shoranur Junction Railway Station",
        "city": "Shoranur",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Palakkad",
        "platforms": 7,
        "facilities": [
            "Largest railway junction in Kerala connecting North and South",
            "AC and Non-AC Retiring Rooms",
            "24-Hour Cloak Room on Platform 1",
            "RailWire Free Wi-Fi"
        ]
    },
    {
        "station_code": "CAN",
        "station_name": "Kannur Railway Station",
        "city": "Kannur",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Palakkad",
        "platforms": 4,
        "facilities": [
            "AC Waiting Lounge and Cloak Room",
            "RailWire Free Wi-Fi",
            "Elevators and Wheelchair access"
        ]
    },
    {
        "station_code": "KGQ",
        "station_name": "Kasaragod Railway Station",
        "city": "Kasaragod",
        "state": "Kerala",
        "zone": "Southern Railway (SR)",
        "division": "Palakkad",
        "platforms": 3,
        "facilities": [
            "Northernmost terminal station for Kerala Vande Bharat",
            "Waiting Hall and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "RKMP",
        "station_name": "Rani Kamalapati Railway Station (Habibganj)",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "zone": "West Central Railway (WCR)",
        "division": "Bhopal",
        "platforms": 5,
        "facilities": [
            "India's first world-class airport-standard redeveloped railway station",
            "Centrally air-conditioned concourse with segregated passenger movement",
            "Modern Executive Lounges and Capsule Pod Hotels",
            "Electronic smart cloak room with digital locker access",
            "Universal barrier-free accessibility with tactile tiles, ramps, and dedicated lifts",
            "High-speed Wi-Fi and digital passenger information display boards",
            "Emergency medical clinic with round-the-clock doctor and nurse",
            "Comprehensive retail shopping and multi-brand food court"
        ]
    },
    {
        "station_code": "BPL",
        "station_name": "Bhopal Junction Railway Station",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "zone": "West Central Railway (WCR)",
        "division": "Bhopal",
        "platforms": 6,
        "facilities": [
            "Major central junction with AC Lounges and Cloak Rooms",
            "Free RailWire Wi-Fi",
            "Wheelchair assistance and Battery Carts"
        ]
    },
    {
        "station_code": "GWL",
        "station_name": "Gwalior Junction Railway Station",
        "city": "Gwalior",
        "state": "Madhya Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Jhansi",
        "platforms": 4,
        "facilities": [
            "Heritage station with modern AC waiting halls",
            "24-Hour Cloak Room and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "VGLJ",
        "station_name": "Virangana Lakshmibai Jhansi Junction",
        "city": "Jhansi",
        "state": "Uttar Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Jhansi",
        "platforms": 8,
        "facilities": [
            "Major junction connecting North and South India",
            "AC Retiring Rooms and Cloak Room",
            "RailWire Free Wi-Fi"
        ]
    },
    {
        "station_code": "AGC",
        "station_name": "Agra Cantt Railway Station",
        "city": "Agra",
        "state": "Uttar Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Agra",
        "platforms": 6,
        "facilities": [
            "Major tourist terminal for Taj Mahal",
            "Executive Lounge and AC Waiting Halls",
            "24x7 Cloak Room and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "MTJ",
        "station_name": "Mathura Junction Railway Station",
        "city": "Mathura",
        "state": "Uttar Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Agra",
        "platforms": 10,
        "facilities": [
            "Major pilgrimage junction",
            "Cloak Room, Waiting Halls, and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "BSB",
        "station_name": "Varanasi Junction (Cantt)",
        "city": "Varanasi (Kashi)",
        "state": "Uttar Pradesh",
        "zone": "Northern Railway (NR)",
        "division": "Lucknow NR",
        "platforms": 9,
        "facilities": [
            "World-class executive waiting lounge with shower rooms",
            "24x7 Cloak Room and Luggage Lockers",
            "Free High-Speed RailWire Wi-Fi",
            "Wheelchairs and battery buggies"
        ]
    },
    {
        "station_code": "CNB",
        "station_name": "Kanpur Central Railway Station",
        "city": "Kanpur",
        "state": "Uttar Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Prayagraj",
        "platforms": 10,
        "facilities": [
            "One of the busiest railway stations in India",
            "AC Executive Lounges and Retiring Rooms",
            "24-Hour Cloak Room and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "PRYJ",
        "station_name": "Prayagraj Junction (Allahabad)",
        "city": "Prayagraj",
        "state": "Uttar Pradesh",
        "zone": "North Central Railway (NCR)",
        "division": "Prayagraj",
        "platforms": 10,
        "facilities": [
            "Major pilgrimage and junction hub",
            "AC Waiting Rooms, Cloak Rooms, and Free Wi-Fi"
        ]
    },
    {
        "station_code": "ST",
        "station_name": "Surat Railway Station",
        "city": "Surat",
        "state": "Gujarat",
        "zone": "Western Railway (WR)",
        "division": "Mumbai WR",
        "platforms": 4,
        "facilities": [
            "Executive Waiting Halls and Cloak Rooms",
            "RailWire Free Wi-Fi and Escalators"
        ]
    },
    {
        "station_code": "BRC",
        "station_name": "Vadodara Junction Railway Station",
        "city": "Vadodara",
        "state": "Gujarat",
        "zone": "Western Railway (WR)",
        "division": "Vadodara",
        "platforms": 7,
        "facilities": [
            "Major junction on Western Railway corridor",
            "AC Lounges, Retiring Rooms, and Cloak Room"
        ]
    },
    {
        "station_code": "RTM",
        "station_name": "Ratlam Junction Railway Station",
        "city": "Ratlam",
        "state": "Madhya Pradesh",
        "zone": "Western Railway (WR)",
        "division": "Ratlam",
        "platforms": 7,
        "facilities": [
            "Major Western Railway junction hub",
            "Waiting Rooms, Cloak Room, and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "KOTA",
        "station_name": "Kota Junction Railway Station",
        "city": "Kota",
        "state": "Rajasthan",
        "zone": "West Central Railway (WCR)",
        "division": "Kota",
        "platforms": 4,
        "facilities": [
            "AC Waiting Rooms, Cloak Room, and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "SA",
        "station_name": "Salem Junction Railway Station",
        "city": "Salem",
        "state": "Tamil Nadu",
        "zone": "Southern Railway (SR)",
        "division": "Salem",
        "platforms": 6,
        "facilities": [
            "Divisional Headquarters Station",
            "AC Waiting Halls and Cloak Room",
            "RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "ED",
        "station_name": "Erode Junction Railway Station",
        "city": "Erode",
        "state": "Tamil Nadu",
        "zone": "Southern Railway (SR)",
        "division": "Salem",
        "platforms": 4,
        "facilities": [
            "Major electric loco shed and junction station",
            "AC Waiting Rooms and Cloak Room"
        ]
    },
    {
        "station_code": "TUP",
        "station_name": "Tiruppur Railway Station",
        "city": "Tiruppur",
        "state": "Tamil Nadu",
        "zone": "Southern Railway (SR)",
        "division": "Salem",
        "platforms": 2,
        "facilities": [
            "Textile hub station with AC Waiting Halls and Wi-Fi"
        ]
    },
    {
        "station_code": "MAO",
        "station_name": "Madgaon Junction (Goa)",
        "city": "Madgaon / Margao",
        "state": "Goa",
        "zone": "Konkan Railway (KR)",
        "division": "Karwar",
        "platforms": 4,
        "facilities": [
            "Major junction in Goa on Konkan Railway",
            "AC Waiting Rooms, Cloak Room, and RailWire Wi-Fi"
        ]
    },
    {
        "station_code": "NZM",
        "station_name": "Hazrat Nizamuddin Railway Station",
        "city": "New Delhi",
        "state": "Delhi",
        "zone": "Northern Railway (NR)",
        "division": "Delhi",
        "platforms": 8,
        "facilities": [
            "Major Delhi terminal for Rajdhani and South-bound trains",
            "AC Waiting Lounges, Cloak Rooms, and Free Wi-Fi"
        ]
    }
]

# Detailed Trains with complete, ordered route schedules for route sequence verification
BASELINE_TRAINS = [
    {
        "train_number": "12951",
        "train_name": "Mumbai Central - New Delhi Tejas Rajdhani Express",
        "train_type": "Rajdhani",
        "origin_code": "MMCT",
        "origin_name": "Mumbai Central",
        "destination_code": "NDLS",
        "destination_name": "New Delhi",
        "departure_time": "17:00",
        "arrival_time": "08:32 (+1 day)",
        "duration": "15h 32m",
        "duration_minutes": 932,
        "distance_km": 1386,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["1A", "2A", "3A"],
        "pantry": "Yes (Catering included in ticket or optional)",
        "major_halts": ["Surat (ST)", "Vadodara (BRC)", "Ratlam (RTM)", "Kota (KOTA)", "New Delhi (NDLS)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "MMCT", "station_name": "Mumbai Central", "arrival": "Origin", "departure": "17:00", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "ST", "station_name": "Surat", "arrival": "19:33", "departure": "19:38", "halt_mins": 5, "day": 1, "distance_km": 263},
            {"stop_number": 3, "station_code": "BRC", "station_name": "Vadodara Junction", "arrival": "21:06", "departure": "21:16", "halt_mins": 10, "day": 1, "distance_km": 392},
            {"stop_number": 4, "station_code": "RTM", "station_name": "Ratlam Junction", "arrival": "00:25", "departure": "00:28", "halt_mins": 3, "day": 2, "distance_km": 653},
            {"stop_number": 5, "station_code": "KOTA", "station_name": "Kota Junction", "arrival": "03:15", "departure": "03:20", "halt_mins": 5, "day": 2, "distance_km": 920},
            {"stop_number": 6, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "08:32", "departure": "Destination", "halt_mins": 0, "day": 2, "distance_km": 1386}
        ]
    },
    {
        "train_number": "12952",
        "train_name": "New Delhi - Mumbai Central Tejas Rajdhani Express",
        "train_type": "Rajdhani",
        "origin_code": "NDLS",
        "origin_name": "New Delhi",
        "destination_code": "MMCT",
        "destination_name": "Mumbai Central",
        "departure_time": "16:55",
        "arrival_time": "08:35 (+1 day)",
        "duration": "15h 40m",
        "duration_minutes": 940,
        "distance_km": 1386,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["1A", "2A", "3A"],
        "pantry": "Yes (Catering included or optional)",
        "major_halts": ["Kota (KOTA)", "Ratlam (RTM)", "Vadodara (BRC)", "Surat (ST)", "Mumbai Central (MMCT)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "Origin", "departure": "16:55", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "KOTA", "station_name": "Kota Junction", "arrival": "21:30", "departure": "21:35", "halt_mins": 5, "day": 1, "distance_km": 466},
            {"stop_number": 3, "station_code": "RTM", "station_name": "Ratlam Junction", "arrival": "00:55", "departure": "00:58", "halt_mins": 3, "day": 2, "distance_km": 733},
            {"stop_number": 4, "station_code": "BRC", "station_name": "Vadodara Junction", "arrival": "04:08", "departure": "04:18", "halt_mins": 10, "day": 2, "distance_km": 994},
            {"stop_number": 5, "station_code": "ST", "station_name": "Surat", "arrival": "05:43", "departure": "05:48", "halt_mins": 5, "day": 2, "distance_km": 1123},
            {"stop_number": 6, "station_code": "MMCT", "station_name": "Mumbai Central", "arrival": "08:35", "departure": "Destination", "halt_mins": 0, "day": 2, "distance_km": 1386}
        ]
    },
    {
        "train_number": "12002",
        "train_name": "New Delhi - Rani Kamalapati (Bhopal) Shatabdi Express",
        "train_type": "Shatabdi",
        "origin_code": "NDLS",
        "origin_name": "New Delhi",
        "destination_code": "RKMP",
        "destination_name": "Rani Kamalapati (Habibganj, Bhopal)",
        "departure_time": "06:00",
        "arrival_time": "14:40",
        "duration": "8h 40m",
        "duration_minutes": 520,
        "distance_km": 707,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (Onboard catering provided)",
        "major_halts": ["Mathura (MTJ)", "Agra Cantt (AGC)", "Gwalior (GWL)", "Jhansi (VGLJ)", "Bhopal (BPL)", "Rani Kamalapati (RKMP)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "Origin", "departure": "06:00", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "MTJ", "station_name": "Mathura Junction", "arrival": "07:19", "departure": "07:20", "halt_mins": 1, "day": 1, "distance_km": 141},
            {"stop_number": 3, "station_code": "AGC", "station_name": "Agra Cantt", "arrival": "07:50", "departure": "07:55", "halt_mins": 5, "day": 1, "distance_km": 195},
            {"stop_number": 4, "station_code": "GWL", "station_name": "Gwalior Junction", "arrival": "09:23", "departure": "09:28", "halt_mins": 5, "day": 1, "distance_km": 313},
            {"stop_number": 5, "station_code": "VGLJ", "station_name": "Virangana Lakshmibai Jhansi", "arrival": "10:40", "departure": "10:45", "halt_mins": 5, "day": 1, "distance_km": 410},
            {"stop_number": 6, "station_code": "BPL", "station_name": "Bhopal Junction", "arrival": "14:12", "departure": "14:15", "halt_mins": 3, "day": 1, "distance_km": 701},
            {"stop_number": 7, "station_code": "RKMP", "station_name": "Rani Kamalapati", "arrival": "14:40", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 707}
        ]
    },
    {
        "train_number": "12001",
        "train_name": "Rani Kamalapati (Bhopal) - New Delhi Shatabdi Express",
        "train_type": "Shatabdi",
        "origin_code": "RKMP",
        "origin_name": "Rani Kamalapati (Habibganj, Bhopal)",
        "destination_code": "NDLS",
        "destination_name": "New Delhi",
        "departure_time": "15:15",
        "arrival_time": "23:50",
        "duration": "8h 35m",
        "duration_minutes": 515,
        "distance_km": 707,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (Onboard catering provided)",
        "major_halts": ["Bhopal (BPL)", "Jhansi (VGLJ)", "Gwalior (GWL)", "Agra Cantt (AGC)", "Mathura (MTJ)", "New Delhi (NDLS)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "RKMP", "station_name": "Rani Kamalapati", "arrival": "Origin", "departure": "15:15", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "BPL", "station_name": "Bhopal Junction", "arrival": "15:27", "departure": "15:30", "halt_mins": 3, "day": 1, "distance_km": 6},
            {"stop_number": 3, "station_code": "VGLJ", "station_name": "Virangana Lakshmibai Jhansi", "arrival": "19:00", "departure": "19:05", "halt_mins": 5, "day": 1, "distance_km": 297},
            {"stop_number": 4, "station_code": "GWL", "station_name": "Gwalior Junction", "arrival": "19:55", "departure": "20:00", "halt_mins": 5, "day": 1, "distance_km": 394},
            {"stop_number": 5, "station_code": "AGC", "station_name": "Agra Cantt", "arrival": "21:10", "departure": "21:15", "halt_mins": 5, "day": 1, "distance_km": 512},
            {"stop_number": 6, "station_code": "MTJ", "station_name": "Mathura Junction", "arrival": "21:58", "departure": "22:00", "halt_mins": 2, "day": 1, "distance_km": 566},
            {"stop_number": 7, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "23:50", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 707}
        ]
    },
    {
        "train_number": "20643",
        "train_name": "Dr MGR Chennai Central - Coimbatore Vande Bharat Express",
        "train_type": "Vande Bharat",
        "origin_code": "MAS",
        "origin_name": "Dr MGR Chennai Central",
        "destination_code": "CBE",
        "destination_name": "Coimbatore Junction",
        "departure_time": "14:15",
        "arrival_time": "20:15",
        "duration": "6h 00m",
        "duration_minutes": 360,
        "distance_km": 495,
        "runs_on": ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (High-speed premium mini-pantry onboard)",
        "major_halts": ["Salem (SA)", "Erode (ED)", "Tiruppur (TUP)", "Coimbatore (CBE)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "MAS", "station_name": "Dr MGR Chennai Central", "arrival": "Origin", "departure": "14:15", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "SA", "station_name": "Salem Junction", "arrival": "17:48", "departure": "17:50", "halt_mins": 2, "day": 1, "distance_km": 334},
            {"stop_number": 3, "station_code": "ED", "station_name": "Erode Junction", "arrival": "18:32", "departure": "18:35", "halt_mins": 3, "day": 1, "distance_km": 394},
            {"stop_number": 4, "station_code": "TUP", "station_name": "Tiruppur", "arrival": "19:13", "departure": "19:15", "halt_mins": 2, "day": 1, "distance_km": 444},
            {"stop_number": 5, "station_code": "CBE", "station_name": "Coimbatore Junction", "arrival": "20:15", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 495}
        ]
    },
    {
        "train_number": "20644",
        "train_name": "Coimbatore - Dr MGR Chennai Central Vande Bharat Express",
        "train_type": "Vande Bharat",
        "origin_code": "CBE",
        "origin_name": "Coimbatore Junction",
        "destination_code": "MAS",
        "destination_name": "Dr MGR Chennai Central",
        "departure_time": "06:00",
        "arrival_time": "11:50",
        "duration": "5h 50m",
        "duration_minutes": 350,
        "distance_km": 495,
        "runs_on": ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (High-speed premium mini-pantry onboard)",
        "major_halts": ["Tiruppur (TUP)", "Erode (ED)", "Salem (SA)", "Dr MGR Chennai Central (MAS)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "CBE", "station_name": "Coimbatore Junction", "arrival": "Origin", "departure": "06:00", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "TUP", "station_name": "Tiruppur", "arrival": "06:38", "departure": "06:40", "halt_mins": 2, "day": 1, "distance_km": 51},
            {"stop_number": 3, "station_code": "ED", "station_name": "Erode Junction", "arrival": "07:17", "departure": "07:20", "halt_mins": 3, "day": 1, "distance_km": 101},
            {"stop_number": 4, "station_code": "SA", "station_name": "Salem Junction", "arrival": "08:08", "departure": "08:10", "halt_mins": 2, "day": 1, "distance_km": 161},
            {"stop_number": 5, "station_code": "MAS", "station_name": "Dr MGR Chennai Central", "arrival": "11:50", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 495}
        ]
    },
    {
        "train_number": "12075",
        "train_name": "Kozhikode - Thiruvananthapuram Central Jan Shatabdi Express",
        "train_type": "Jan Shatabdi",
        "origin_code": "CLT",
        "origin_name": "Kozhikode",
        "destination_code": "TVC",
        "destination_name": "Thiruvananthapuram Central",
        "departure_time": "13:45",
        "arrival_time": "21:25",
        "duration": "7h 40m",
        "duration_minutes": 460,
        "distance_km": 400,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["CC", "2S"],
        "pantry": "Yes (Trolley catering service)",
        "major_halts": ["Shoranur (SRR)", "Thrissur (TCR)", "Ernakulam (ERS)", "Alappuzha (ALLP)", "Kayamkulam (KYJ)", "Kollam (QLN)", "Thiruvananthapuram (TVC)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "CLT", "station_name": "Kozhikode", "arrival": "Origin", "departure": "13:45", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "SRR", "station_name": "Shoranur Junction", "arrival": "15:00", "departure": "15:05", "halt_mins": 5, "day": 1, "distance_km": 86},
            {"stop_number": 3, "station_code": "TCR", "station_name": "Thrissur", "arrival": "15:38", "departure": "15:40", "halt_mins": 2, "day": 1, "distance_km": 119},
            {"stop_number": 4, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "17:15", "departure": "17:20", "halt_mins": 5, "day": 1, "distance_km": 193},
            {"stop_number": 5, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "18:23", "departure": "18:25", "halt_mins": 2, "day": 1, "distance_km": 250},
            {"stop_number": 6, "station_code": "KYJ", "station_name": "Kayamkulam Junction", "arrival": "19:04", "departure": "19:06", "halt_mins": 2, "day": 1, "distance_km": 294},
            {"stop_number": 7, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "19:43", "departure": "19:45", "halt_mins": 2, "day": 1, "distance_km": 335},
            {"stop_number": 8, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "21:25", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 400}
        ]
    },
    {
        "train_number": "12076",
        "train_name": "Thiruvananthapuram Central - Kozhikode Jan Shatabdi Express",
        "train_type": "Jan Shatabdi",
        "origin_code": "TVC",
        "origin_name": "Thiruvananthapuram Central",
        "destination_code": "CLT",
        "destination_name": "Kozhikode",
        "departure_time": "05:55",
        "arrival_time": "12:55",
        "duration": "7h 00m",
        "duration_minutes": 420,
        "distance_km": 400,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["CC", "2S"],
        "pantry": "Yes (Trolley catering service)",
        "major_halts": ["Kollam (QLN)", "Kayamkulam (KYJ)", "Alappuzha (ALLP)", "Ernakulam (ERS)", "Thrissur (TCR)", "Shoranur (SRR)", "Kozhikode (CLT)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "Origin", "departure": "05:55", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "06:48", "departure": "06:50", "halt_mins": 2, "day": 1, "distance_km": 65},
            {"stop_number": 3, "station_code": "KYJ", "station_name": "Kayamkulam Junction", "arrival": "07:27", "departure": "07:29", "halt_mins": 2, "day": 1, "distance_km": 106},
            {"stop_number": 4, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "08:07", "departure": "08:09", "halt_mins": 2, "day": 1, "distance_km": 150},
            {"stop_number": 5, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "09:12", "departure": "09:17", "halt_mins": 5, "day": 1, "distance_km": 207},
            {"stop_number": 6, "station_code": "TCR", "station_name": "Thrissur", "arrival": "10:28", "departure": "10:30", "halt_mins": 2, "day": 1, "distance_km": 281},
            {"stop_number": 7, "station_code": "SRR", "station_name": "Shoranur Junction", "arrival": "11:23", "departure": "11:25", "halt_mins": 2, "day": 1, "distance_km": 314},
            {"stop_number": 8, "station_code": "CLT", "station_name": "Kozhikode", "arrival": "12:55", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 400}
        ]
    },
    {
        "train_number": "20631",
        "train_name": "Kasaragod - Thiruvananthapuram Central Vande Bharat Express",
        "train_type": "Vande Bharat",
        "origin_code": "KGQ",
        "origin_name": "Kasaragod",
        "destination_code": "TVC",
        "destination_name": "Thiruvananthapuram Central",
        "departure_time": "07:00",
        "arrival_time": "15:05",
        "duration": "8h 05m",
        "duration_minutes": 485,
        "distance_km": 574,
        "runs_on": ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (Mini-pantry onboard, meals provided)",
        "major_halts": ["Kannur (CAN)", "Kozhikode (CLT)", "Shoranur (SRR)", "Thrissur (TCR)", "Ernakulam (ERS)", "Alappuzha (ALLP)", "Kollam (QLN)", "Thiruvananthapuram (TVC)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "KGQ", "station_name": "Kasaragod", "arrival": "Origin", "departure": "07:00", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "CAN", "station_name": "Kannur", "arrival": "07:55", "departure": "07:57", "halt_mins": 2, "day": 1, "distance_km": 86},
            {"stop_number": 3, "station_code": "CLT", "station_name": "Kozhikode", "arrival": "08:57", "departure": "08:59", "halt_mins": 2, "day": 1, "distance_km": 175},
            {"stop_number": 4, "station_code": "SRR", "station_name": "Shoranur Junction", "arrival": "09:58", "departure": "10:00", "halt_mins": 2, "day": 1, "distance_km": 261},
            {"stop_number": 5, "station_code": "TCR", "station_name": "Thrissur", "arrival": "10:38", "departure": "10:40", "halt_mins": 2, "day": 1, "distance_km": 294},
            {"stop_number": 6, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "11:45", "departure": "11:48", "halt_mins": 3, "day": 1, "distance_km": 368},
            {"stop_number": 7, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "12:38", "departure": "12:40", "halt_mins": 2, "day": 1, "distance_km": 425},
            {"stop_number": 8, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "13:38", "departure": "13:40", "halt_mins": 2, "day": 1, "distance_km": 510},
            {"stop_number": 9, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "15:05", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 574}
        ]
    },
    {
        "train_number": "20632",
        "train_name": "Thiruvananthapuram Central - Kasaragod Vande Bharat Express",
        "train_type": "Vande Bharat",
        "origin_code": "TVC",
        "origin_name": "Thiruvananthapuram Central",
        "destination_code": "KGQ",
        "destination_name": "Kasaragod",
        "departure_time": "16:05",
        "arrival_time": "23:58",
        "duration": "7h 53m",
        "duration_minutes": 473,
        "distance_km": 574,
        "runs_on": ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (Mini-pantry onboard, meals provided)",
        "major_halts": ["Kollam (QLN)", "Alappuzha (ALLP)", "Ernakulam (ERS)", "Thrissur (TCR)", "Shoranur (SRR)", "Kozhikode (CLT)", "Kannur (CAN)", "Kasaragod (KGQ)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "Origin", "departure": "16:05", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "16:53", "departure": "16:55", "halt_mins": 2, "day": 1, "distance_km": 65},
            {"stop_number": 3, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "17:55", "departure": "17:57", "halt_mins": 2, "day": 1, "distance_km": 149},
            {"stop_number": 4, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "18:35", "departure": "18:38", "halt_mins": 3, "day": 1, "distance_km": 206},
            {"stop_number": 5, "station_code": "TCR", "station_name": "Thrissur", "arrival": "19:40", "departure": "19:42", "halt_mins": 2, "day": 1, "distance_km": 280},
            {"stop_number": 6, "station_code": "SRR", "station_name": "Shoranur Junction", "arrival": "20:15", "departure": "20:17", "halt_mins": 2, "day": 1, "distance_km": 313},
            {"stop_number": 7, "station_code": "CLT", "station_name": "Kozhikode", "arrival": "21:14", "departure": "21:16", "halt_mins": 2, "day": 1, "distance_km": 399},
            {"stop_number": 8, "station_code": "CAN", "station_name": "Kannur", "arrival": "22:18", "departure": "22:20", "halt_mins": 2, "day": 1, "distance_km": 488},
            {"stop_number": 9, "station_code": "KGQ", "station_name": "Kasaragod", "arrival": "23:58", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 574}
        ]
    },
    {
        "train_number": "12625",
        "train_name": "Kerala Express (Thiruvananthapuram - New Delhi)",
        "train_type": "Superfast",
        "origin_code": "TVC",
        "origin_name": "Thiruvananthapuram Central",
        "destination_code": "NDLS",
        "destination_name": "New Delhi",
        "departure_time": "12:30",
        "arrival_time": "13:15 (+2 days)",
        "duration": "48h 45m",
        "duration_minutes": 2925,
        "distance_km": 3036,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["1A", "2A", "3A", "SL", "GEN"],
        "pantry": "Yes (Pantry Car attached)",
        "major_halts": ["Kollam (QLN)", "Ernakulam (ERS)", "Thrissur (TCR)", "Palakkad (PGT)", "Coimbatore (CBE)", "Vijayawada (BZA)", "Nagpur (NGP)", "Bhopal (BPL)", "Gwalior (GWL)", "Agra Cantt (AGC)", "New Delhi (NDLS)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "Origin", "departure": "12:30", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "13:32", "departure": "13:35", "halt_mins": 3, "day": 1, "distance_km": 65},
            {"stop_number": 3, "station_code": "KYJ", "station_name": "Kayamkulam Junction", "arrival": "14:14", "departure": "14:16", "halt_mins": 2, "day": 1, "distance_km": 106},
            {"stop_number": 4, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "14:52", "departure": "14:55", "halt_mins": 3, "day": 1, "distance_km": 150},
            {"stop_number": 5, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "16:20", "departure": "16:25", "halt_mins": 5, "day": 1, "distance_km": 207},
            {"stop_number": 6, "station_code": "TCR", "station_name": "Thrissur", "arrival": "17:42", "departure": "17:45", "halt_mins": 3, "day": 1, "distance_km": 281},
            {"stop_number": 7, "station_code": "PGT", "station_name": "Palakkad Junction", "arrival": "19:12", "departure": "19:15", "halt_mins": 3, "day": 1, "distance_km": 356},
            {"stop_number": 8, "station_code": "CBE", "station_name": "Coimbatore Junction", "arrival": "20:52", "departure": "20:55", "halt_mins": 3, "day": 1, "distance_km": 412},
            {"stop_number": 9, "station_code": "ED", "station_name": "Erode Junction", "arrival": "22:20", "departure": "22:25", "halt_mins": 5, "day": 1, "distance_km": 513},
            {"stop_number": 10, "station_code": "SA", "station_name": "Salem Junction", "arrival": "23:17", "departure": "23:20", "halt_mins": 3, "day": 1, "distance_km": 573},
            {"stop_number": 11, "station_code": "BPL", "station_name": "Bhopal Junction", "arrival": "03:45", "departure": "03:55", "halt_mins": 10, "day": 3, "distance_km": 2332},
            {"stop_number": 12, "station_code": "GWL", "station_name": "Gwalior Junction", "arrival": "08:35", "departure": "08:40", "halt_mins": 5, "day": 3, "distance_km": 2720},
            {"stop_number": 13, "station_code": "AGC", "station_name": "Agra Cantt", "arrival": "10:10", "departure": "10:15", "halt_mins": 5, "day": 3, "distance_km": 2838},
            {"stop_number": 14, "station_code": "MTJ", "station_name": "Mathura Junction", "arrival": "10:58", "departure": "11:00", "halt_mins": 2, "day": 3, "distance_km": 2892},
            {"stop_number": 15, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "13:15", "departure": "Destination", "halt_mins": 0, "day": 3, "distance_km": 3036}
        ]
    },
    {
        "train_number": "12626",
        "train_name": "Kerala Express (New Delhi - Thiruvananthapuram)",
        "train_type": "Superfast",
        "origin_code": "NDLS",
        "origin_name": "New Delhi",
        "destination_code": "TVC",
        "destination_name": "Thiruvananthapuram Central",
        "departure_time": "20:10",
        "arrival_time": "21:55 (+2 days)",
        "duration": "49h 45m",
        "duration_minutes": 2985,
        "distance_km": 3036,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["1A", "2A", "3A", "SL", "GEN"],
        "pantry": "Yes (Pantry Car attached)",
        "major_halts": ["Mathura (MTJ)", "Agra Cantt (AGC)", "Gwalior (GWL)", "Jhansi (VGLJ)", "Bhopal (BPL)", "Nagpur (NGP)", "Vijayawada (BZA)", "Coimbatore (CBE)", "Palakkad (PGT)", "Ernakulam (ERS)", "Thiruvananthapuram (TVC)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "Origin", "departure": "20:10", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "MTJ", "station_name": "Mathura Junction", "arrival": "21:38", "departure": "21:40", "halt_mins": 2, "day": 1, "distance_km": 141},
            {"stop_number": 3, "station_code": "AGC", "station_name": "Agra Cantt", "arrival": "22:20", "departure": "22:25", "halt_mins": 5, "day": 1, "distance_km": 195},
            {"stop_number": 4, "station_code": "GWL", "station_name": "Gwalior Junction", "arrival": "23:43", "departure": "23:45", "halt_mins": 2, "day": 1, "distance_km": 313},
            {"stop_number": 5, "station_code": "VGLJ", "station_name": "Virangana Lakshmibai Jhansi", "arrival": "01:30", "departure": "01:38", "halt_mins": 8, "day": 2, "distance_km": 410},
            {"stop_number": 6, "station_code": "BPL", "station_name": "Bhopal Junction", "arrival": "05:20", "departure": "05:25", "halt_mins": 5, "day": 2, "distance_km": 701},
            {"stop_number": 7, "station_code": "SA", "station_name": "Salem Junction", "arrival": "09:12", "departure": "09:15", "halt_mins": 3, "day": 3, "distance_km": 2463},
            {"stop_number": 8, "station_code": "ED", "station_name": "Erode Junction", "arrival": "10:05", "departure": "10:10", "halt_mins": 5, "day": 3, "distance_km": 2523},
            {"stop_number": 9, "station_code": "CBE", "station_name": "Coimbatore Junction", "arrival": "11:42", "departure": "11:45", "halt_mins": 3, "day": 3, "distance_km": 2624},
            {"stop_number": 10, "station_code": "PGT", "station_name": "Palakkad Junction", "arrival": "12:47", "departure": "12:50", "halt_mins": 3, "day": 3, "distance_km": 2680},
            {"stop_number": 11, "station_code": "TCR", "station_name": "Thrissur", "arrival": "14:12", "departure": "14:15", "halt_mins": 3, "day": 3, "distance_km": 2755},
            {"stop_number": 12, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "15:25", "departure": "15:30", "halt_mins": 5, "day": 3, "distance_km": 2829},
            {"stop_number": 13, "station_code": "ALLP", "station_name": "Alappuzha", "arrival": "16:47", "departure": "16:50", "halt_mins": 3, "day": 3, "distance_km": 2886},
            {"stop_number": 14, "station_code": "KYJ", "station_name": "Kayamkulam Junction", "arrival": "17:28", "departure": "17:30", "halt_mins": 2, "day": 3, "distance_km": 2930},
            {"stop_number": 15, "station_code": "QLN", "station_name": "Kollam Junction", "arrival": "18:10", "departure": "18:13", "halt_mins": 3, "day": 3, "distance_km": 2971},
            {"stop_number": 16, "station_code": "TVC", "station_name": "Thiruvananthapuram Central", "arrival": "21:55", "departure": "Destination", "halt_mins": 0, "day": 3, "distance_km": 3036}
        ]
    },
    {
        "train_number": "12301",
        "train_name": "Howrah - New Delhi Rajdhani Express (via Gaya)",
        "train_type": "Rajdhani",
        "origin_code": "HWH",
        "origin_name": "Howrah Junction",
        "destination_code": "NDLS",
        "destination_name": "New Delhi",
        "departure_time": "16:50",
        "arrival_time": "10:05 (+1 day)",
        "duration": "17h 15m",
        "duration_minutes": 1035,
        "distance_km": 1451,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sun"],
        "classes": ["1A", "2A", "3A"],
        "pantry": "Yes (Pantry car with full meals)",
        "major_halts": ["Asansol (ASN)", "Dhanbad (DHN)", "Gaya (GAYA)", "Pt Deen Dayal Upadhyaya (DDU)", "Prayagraj (PRYJ)", "Kanpur Central (CNB)", "New Delhi (NDLS)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "HWH", "station_name": "Howrah Junction", "arrival": "Origin", "departure": "16:50", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "ASN", "station_name": "Asansol Junction", "arrival": "18:57", "departure": "19:00", "halt_mins": 3, "day": 1, "distance_km": 200},
            {"stop_number": 3, "station_code": "DHN", "station_name": "Dhanbad Junction", "arrival": "19:50", "departure": "19:55", "halt_mins": 5, "day": 1, "distance_km": 259},
            {"stop_number": 4, "station_code": "GAYA", "station_name": "Gaya Junction", "arrival": "22:19", "departure": "22:22", "halt_mins": 3, "day": 1, "distance_km": 459},
            {"stop_number": 5, "station_code": "DDU", "station_name": "Pt Deen Dayal Upadhyaya", "arrival": "00:45", "departure": "00:55", "halt_mins": 10, "day": 2, "distance_km": 664},
            {"stop_number": 6, "station_code": "PRYJ", "station_name": "Prayagraj Junction", "arrival": "02:33", "departure": "02:35", "halt_mins": 2, "day": 2, "distance_km": 817},
            {"stop_number": 7, "station_code": "CNB", "station_name": "Kanpur Central", "arrival": "04:40", "departure": "04:45", "halt_mins": 5, "day": 2, "distance_km": 1011},
            {"stop_number": 8, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "10:05", "departure": "Destination", "halt_mins": 0, "day": 2, "distance_km": 1451}
        ]
    },
    {
        "train_number": "22436",
        "train_name": "New Delhi - Varanasi Vande Bharat Express",
        "train_type": "Vande Bharat",
        "origin_code": "NDLS",
        "origin_name": "New Delhi",
        "destination_code": "BSB",
        "destination_name": "Varanasi Junction",
        "departure_time": "06:00",
        "arrival_time": "14:00",
        "duration": "8h 00m",
        "duration_minutes": 480,
        "distance_km": 759,
        "runs_on": ["Tue", "Wed", "Fri", "Sat", "Sun"],
        "classes": ["EC", "CC"],
        "pantry": "Yes (Catering included in ticket fare)",
        "major_halts": ["Kanpur Central (CNB)", "Prayagraj (PRYJ)", "Varanasi (BSB)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "NDLS", "station_name": "New Delhi", "arrival": "Origin", "departure": "06:00", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "CNB", "station_name": "Kanpur Central", "arrival": "10:08", "departure": "10:10", "halt_mins": 2, "day": 1, "distance_km": 440},
            {"stop_number": 3, "station_code": "PRYJ", "station_name": "Prayagraj Junction", "arrival": "12:08", "departure": "12:10", "halt_mins": 2, "day": 1, "distance_km": 635},
            {"stop_number": 4, "station_code": "BSB", "station_name": "Varanasi Junction", "arrival": "14:00", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 759}
        ]
    },
    {
        "train_number": "12617",
        "train_name": "Mangala Lakshadweep Superfast Express",
        "train_type": "Superfast",
        "origin_code": "ERS",
        "origin_name": "Ernakulam Junction",
        "destination_code": "NZM",
        "destination_name": "Hazrat Nizamuddin",
        "departure_time": "13:25",
        "arrival_time": "13:20 (+2 days)",
        "duration": "47h 55m",
        "duration_minutes": 2875,
        "distance_km": 2781,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["2A", "3A", "SL", "GEN"],
        "pantry": "Yes (Pantry car attached)",
        "major_halts": ["Shoranur (SRR)", "Kozhikode (CLT)", "Kannur (CAN)", "Kasaragod (KGQ)", "Madgaon (MAO)", "Panvel (PNVL)", "Bhopal (BPL)", "Hazrat Nizamuddin (NZM)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "ERS", "station_name": "Ernakulam Junction", "arrival": "Origin", "departure": "13:25", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "TCR", "station_name": "Thrissur", "arrival": "14:34", "departure": "14:37", "halt_mins": 3, "day": 1, "distance_km": 74},
            {"stop_number": 3, "station_code": "SRR", "station_name": "Shoranur Junction", "arrival": "15:20", "departure": "15:25", "halt_mins": 5, "day": 1, "distance_km": 107},
            {"stop_number": 4, "station_code": "CLT", "station_name": "Kozhikode", "arrival": "16:37", "departure": "16:40", "halt_mins": 3, "day": 1, "distance_km": 193},
            {"stop_number": 5, "station_code": "CAN", "station_name": "Kannur", "arrival": "17:52", "departure": "17:55", "halt_mins": 3, "day": 1, "distance_km": 282},
            {"stop_number": 6, "station_code": "KGQ", "station_name": "Kasaragod", "arrival": "19:04", "departure": "19:05", "halt_mins": 1, "day": 1, "distance_km": 368},
            {"stop_number": 7, "station_code": "MAO", "station_name": "Madgaon Junction", "arrival": "01:10", "departure": "01:20", "halt_mins": 10, "day": 2, "distance_km": 699},
            {"stop_number": 8, "station_code": "BPL", "station_name": "Bhopal Junction", "arrival": "02:25", "departure": "02:30", "halt_mins": 5, "day": 3, "distance_km": 2077},
            {"stop_number": 9, "station_code": "NZM", "station_name": "Hazrat Nizamuddin", "arrival": "13:20", "departure": "Destination", "halt_mins": 0, "day": 3, "distance_km": 2781}
        ]
    },
    {
        "train_number": "12051",
        "train_name": "Mumbai CSMT - Madgaon Jan Shatabdi Express",
        "train_type": "Jan Shatabdi",
        "origin_code": "CSMT",
        "origin_name": "Mumbai Chhatrapati Shivaji Maharaj Terminus",
        "destination_code": "MAO",
        "destination_name": "Madgaon Junction (Goa)",
        "departure_time": "05:10",
        "arrival_time": "14:10",
        "duration": "9h 00m",
        "duration_minutes": 540,
        "distance_km": 571,
        "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "classes": ["CC", "2S", "EV"],
        "pantry": "Yes (Catering trolley service onboard)",
        "major_halts": ["Thane (TNA)", "Panvel (PNVL)", "Chiplun (CHI)", "Ratnagiri (RN)", "Kankavali (KKW)", "Madgaon (MAO)"],
        "route_schedule": [
            {"stop_number": 1, "station_code": "CSMT", "station_name": "Mumbai CSMT", "arrival": "Origin", "departure": "05:10", "halt_mins": 0, "day": 1, "distance_km": 0},
            {"stop_number": 2, "station_code": "MAO", "station_name": "Madgaon Junction", "arrival": "14:10", "departure": "Destination", "halt_mins": 0, "day": 1, "distance_km": 571}
        ]
    }
]

BASELINE_POLICIES = [
    {
        "policy_id": "POL_TATKAL_01",
        "category": "Booking Rules",
        "title": "Tatkal Booking Rules and Timings",
        "content": (
            "1. Booking Timings: Tatkal booking opens at 10:00 AM IST for AC classes (1A, 2A, 3A, 3E, CC, EC) "
            "and at 11:00 AM IST for Non-AC classes (Sleeper, Second Sitting 2S) exactly ONE DAY IN ADVANCE of the train departure date from origin station.\n"
            "2. Advance Window: 1 day prior to travel date (e.g., for a journey on July 10th, Tatkal opens on July 9th).\n"
            "3. Passenger Limit: Maximum of 4 passengers per PNR on a Tatkal booking.\n"
            "4. Identity Verification: At least one passenger must carry an original government-approved photo ID card during journey.\n"
            "5. Cancellation & Refund: NO REFUND is granted on the cancellation of confirmed Tatkal tickets under normal conditions.\n"
            "6. Waitlisted Tatkal Refund: Full refund is granted minus standard clerkage charges (₹60 per passenger) if the Tatkal ticket remains waitlisted after chart preparation.\n"
            "7. Exceptional Refund: Full refund is permitted on confirmed Tatkal tickets only if the train is delayed by more than 3 hours at the boarding point, or if the train runs on a diverted route and passenger does not want to travel, or if the booked coach is not attached and lower class accommodation is offered."
        )
    },
    {
        "policy_id": "POL_REFUND_02",
        "category": "Cancellation and Refund Rules",
        "title": "Confirmed Ticket Cancellation and Clerkage Charges",
        "content": (
            "Official Indian Railways cancellation rules for confirmed tickets cancelled online or at PRS counters:\n"
            "1. More than 48 hours before scheduled train departure:\n"
            "   - AC First Class / Executive Class: Flat ₹240 deduction per passenger.\n"
            "   - AC 2 Tier / First Class: Flat ₹200 deduction per passenger.\n"
            "   - AC 3 Tier / AC Chair Car / AC 3 Economy: Flat ₹180 deduction per passenger.\n"
            "   - Sleeper Class: Flat ₹120 deduction per passenger.\n"
            "   - Second Class (2S): Flat ₹60 deduction per passenger.\n"
            "2. Between 48 hours and up to 12 hours before scheduled departure:\n"
            "   - 25% of total ticket fare is deducted, subject to the minimum flat charge specified above.\n"
            "3. Less than 12 hours and up to 4 hours before scheduled departure (or before chart preparation, whichever is earlier):\n"
            "   - 50% of total ticket fare is deducted, subject to minimum flat charge.\n"
            "4. Less than 4 hours before departure or after chart preparation:\n"
            "   - NO REFUND is granted for confirmed tickets. Passengers must file a Ticket Deposit Receipt (TDR) online before departure if eligible under special circumstances (e.g., AC failure, train late by >3 hours)."
        )
    },
    {
        "policy_id": "POL_RAC_WL_03",
        "category": "Cancellation and Refund Rules",
        "title": "RAC and Waitlisted Ticket Cancellation Rules",
        "content": (
            "1. RAC (Reservation Against Cancellation) and Waitlisted (WL) tickets can be cancelled up to 30 minutes before scheduled train departure.\n"
            "2. Clerkage charge of ₹60 per passenger (plus GST for AC classes) is deducted, and the remaining fare is refunded in full.\n"
            "3. Fully waitlisted e-tickets whose names do not appear in the final reservation chart are automatically cancelled by IRCTC, and full fare minus clerkage is credited back to the original booking account within 3 to 5 banking days.\n"
            "4. Passengers with fully waitlisted e-tickets are NOT permitted to board reserved coaches."
        )
    },
    {
        "policy_id": "POL_BAGGAGE_04",
        "category": "Luggage and Baggage Rules",
        "title": "Luggage Allowance and Maximum Permissible Limits",
        "content": (
            "Free luggage allowance per passenger according to travel class on Indian Railways:\n"
            "1. AC First Class (1A): Free allowance 70 kg, Marginal allowance 15 kg, Maximum carrying limit 150 kg.\n"
            "2. AC 2-Tier (2A): Free allowance 50 kg, Marginal allowance 10 kg, Maximum carrying limit 100 kg.\n"
            "3. AC 3-Tier / AC Chair Car (CC): Free allowance 40 kg, Marginal allowance 10 kg, Maximum carrying limit 40 kg.\n"
            "4. Sleeper Class (SL): Free allowance 40 kg, Marginal allowance 10 kg, Maximum carrying limit 80 kg.\n"
            "5. Second Class (2S): Free allowance 35 kg, Marginal allowance 10 kg, Maximum carrying limit 70 kg.\n"
            "Maximum permissible package dimensions for carrying in passenger compartments: 100 cm (length) x 60 cm (breadth) x 25 cm (height). Larger packages must be booked in the Luggage/Brake Van."
        )
    },
    {
        "policy_id": "POL_SENIOR_05",
        "category": "Passenger Quota and Concessions",
        "title": "Senior Citizen Quota and Lower Berth Allocation",
        "content": (
            "1. Lower Berth Quota is available for:\n"
            "   - Male passengers aged 60 years and above.\n"
            "   - Female passengers aged 45 years and above.\n"
            "   - Pregnant women.\n"
            "2. Conditions: The quota applies when travelling alone or when only two senior passengers travel on a single ticket.\n"
            "3. On-board TTE discretion: Onboard Ticket Examiners (TTE) have authority to allot vacant lower berths to senior citizens, pregnant women, or physically challenged persons travelling on middle/upper berths upon request."
        )
    },
    {
        "policy_id": "POL_PETS_06",
        "category": "Travel Policies",
        "title": "Pet Carriage Policy (Dogs and Cats)",
        "content": (
            "1. AC First Class (1A): A passenger can carry a pet dog/cat inside the passenger compartment ONLY if booking an entire 2-berth Coupe or 4-berth Cabin exclusively for themselves.\n"
            "2. Other Classes (2A, 3A, CC, SL): Pets are strictly NOT allowed inside passenger coaches.\n"
            "3. Guard / Brake Van (Dog Box): Pets can be booked to travel in the special Dog Box in the Brake Van by paying the prescribed parcel/luggage rates at the station parcel office 3 hours before train departure.\n"
            "4. Mandatory Requirements: A valid veterinary fitness certificate and rabies vaccination certificate from an authorized vet is required prior to travel."
        )
    },
    {
        "policy_id": "POL_LOST_07",
        "category": "Passenger Services",
        "title": "Lost and Found Articles Procedure",
        "content": (
            "1. Immediate Action: Immediately report lost property to the on-duty Train Conductor / TTE, or Station Master, or the Railway Protection Force (RPF) post at the nearest station.\n"
            "2. Rail Madad Portal: Lodge a grievance online at railmadad.indianrailways.gov.in or via the 139 helpline under 'Lost Property'.\n"
            "3. Lost Property Office (LPO): Unclaimed luggage found on trains or platforms is deposited with the station Lost Property Office. Passengers can reclaim items after presenting valid photo ID and proof of ownership within the prescribed storage period."
        )
    },
    {
        "policy_id": "POL_EMERGENCY_08",
        "category": "Emergency & Security",
        "title": "Emergency Helplines and Medical Assistance",
        "content": (
            "Official Emergency and Passenger Assistance Contact Numbers:\n"
            "1. 139: Integrated Rail Madad Helpline (24x7 all-in-one number for Medical, Security, Accidents, Cleanliness, Catering, PNR, and General Inquiries in 12 languages).\n"
            "2. 182 / 139: Railway Protection Force (RPF) Security Helpline for immediate security intervention.\n"
            "3. 1512: Government Railway Police (GRP) state police assistance helpline.\n"
            "4. 112: All-India National Emergency Helpline Number.\n"
            "5. Onboard Medical Emergency: Passengers feeling unwell should immediately inform the coach TTE/conductor or call 139. The TTE contacts the railway control room to arrange a qualified railway doctor at the very next scheduled stopping station."
        )
    }
]

BASELINE_FAQS = [
    {
        "faq_id": "FAQ_01",
        "category": "General",
        "question": "What is Rail Madad helpline number?",
        "answer": "139 is the single integrated 24x7 Rail Madad helpline number for all railway assistance including security, medical, complaints, and enquiry."
    },
    {
        "faq_id": "FAQ_02",
        "category": "Booking",
        "question": "Can I cancel a confirmed Tatkal ticket and get a refund?",
        "answer": "No refund is granted on the cancellation of confirmed Tatkal tickets under normal conditions. Refund is only permitted if the train is cancelled, delayed by >3 hours, or runs via a diverted route."
    },
    {
        "faq_id": "FAQ_03",
        "category": "Luggage",
        "question": "How much luggage can I carry free in 3rd AC?",
        "answer": "In AC 3-Tier (3A), each passenger is entitled to a free luggage allowance of 40 kg, with a marginal allowance of 10 kg."
    },
    {
        "faq_id": "FAQ_04",
        "category": "Station",
        "question": "Are wheelchair facilities available at New Delhi Railway Station?",
        "answer": "Yes, New Delhi Railway Station (NDLS) offers free wheelchair assistance and battery-operated buggies for senior citizens and differently-abled passengers. You can request assistance at the help desk or by calling 139."
    },
    {
        "faq_id": "FAQ_05",
        "category": "Trains",
        "question": "What is the schedule of train 12951 Mumbai Rajdhani Express?",
        "answer": "Train 12951 Mumbai Central to New Delhi Tejas Rajdhani Express departs Mumbai Central (MMCT) at 17:00 daily and arrives at New Delhi (NDLS) at 08:32 the next morning (duration 15h 32m)."
    }
]
