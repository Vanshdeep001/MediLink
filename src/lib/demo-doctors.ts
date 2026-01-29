// Demo doctors for testing ChatDoc functionality
export const addDemoDoctors = () => {
  if (typeof window === 'undefined') return;

  const demoDoctors = [
    {
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@medilink.com',
      phone: '+91-9876543210',
      specialization: 'General Medicine',
      experience: 8,
      degree: 'MBBS, MD',
      licenseNumber: 'DOC001',
      address: '123 Medical Center',
      city: 'Delhi',
      pinCode: '110001',
      password: 'password123',
      confirmPassword: 'password123'
    },
    {
      fullName: 'Dr. Michael Chen',
      email: 'michael.chen@medilink.com',
      phone: '+91-9876543211',
      specialization: 'Cardiology',
      experience: 12,
      degree: 'MBBS, MD Cardiology',
      licenseNumber: 'DOC002',
      address: '456 Heart Hospital',
      city: 'Mumbai',
      pinCode: '400001',
      password: 'password123',
      confirmPassword: 'password123'
    },
    {
      fullName: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@medilink.com',
      phone: '+91-9876543212',
      specialization: 'Pediatrics',
      experience: 6,
      degree: 'MBBS, MD Pediatrics',
      licenseNumber: 'DOC003',
      address: '789 Children Hospital',
      city: 'Chennai',
      pinCode: '600001',
      password: 'password123',
      confirmPassword: 'password123'
    },
    {
      fullName: 'Dr. Manan Arora',
      email: 'manan.arora@medilink.com',
      phone: '+91-9876543213',
      specialization: 'General Physician',
      experience: 10,
      degree: 'MBBS, MD General Medicine',
      licenseNumber: 'DOC004',
      address: '321 General Hospital',
      city: 'Delhi',
      pinCode: '110002',
      password: 'password123',
      confirmPassword: 'password123'
    }
  ];

  // Check if doctors already exist
  const existingDoctors = localStorage.getItem('doctors_list');
  if (!existingDoctors || JSON.parse(existingDoctors).length === 0) {
    localStorage.setItem('doctors_list', JSON.stringify(demoDoctors));
    console.log('Demo doctors added to localStorage');
  } else {
    console.log('Doctors already exist in localStorage');
  }
};

// Function to clear demo doctors (for testing)
export const clearDemoDoctors = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('doctors_list');
  console.log('Demo doctors cleared from localStorage');
};











