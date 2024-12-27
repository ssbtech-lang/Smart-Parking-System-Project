// import styled from 'styled-components';

// const ErrorPageContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 100vh; /* Full viewport height */
//   flex-direction: column;
//   text-align: center;
//   padding: 0 20px; /* Add padding for small screens */

//   @media (max-width: 768px) {
//     padding: 0 10px; /* Adjust padding for small screens */
//   }
// `;

// const ErrorPageTitle = styled.h1`
//   margin-top: 0; /* Remove margin-top for proper centering */
// `;

// const ErrorPageSubtitle = styled.h3`
//   margin-top: 20px; /* Space between title and subtitle */
// `;

// export function NavigateToLocation() {
//   return (
//     <ErrorPageContainer>
//       <ErrorPageTitle>Payment successfull</ErrorPageTitle>
//       <ErrorPageSubtitle>Your slot is booked</ErrorPageSubtitle>
//     </ErrorPageContainer>
//   );
// }

import React, { useState, useEffect } from 'react';

export function NavigateToLocation() {
  const [userLatitude, setUserLatitude] = useState(null); // User's latitude
  const [userLongitude, setUserLongitude] = useState(null); // User's longitude
  const [destination, setDestination] = useState(null); // Destination coordinates
  const [slotId, setSlotId] = useState(''); // Parking slot ID

  // Function to get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLatitude(position.coords.latitude);
          setUserLongitude(position.coords.longitude);
          console.log('User location:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to fetch your location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Function to fetch destination coordinates based on slotId
  const fetchDestination = async () => {
    if (!slotId.trim()) {
      console.error('Slot ID is empty');
      alert('Please enter a valid Slot ID.');
      return;
    }

    try {
      const url = `http://192.168.1.3:3001/api/parkingslots/${encodeURIComponent(slotId)}`;
      console.log('Fetching destination from URL:', url);
  
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          const data = await response.json();
          console.error('Error fetching destination:', data.message);
          alert(`Failed to fetch destination: ${data.message}`);
        } else {
          throw new Error(`Failed to fetch destination details: ${response.status} ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        console.log('Destination fetched:', data);
        setDestination({ latitude: data.latitude, longitude: data.longitude });
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
      alert('Failed to fetch destination. Please check the Slot ID.');
    }
  };

  // Open Google Maps with directions
  const openGoogleMaps = () => {
    if (userLatitude && userLongitude && destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${destination.latitude},${destination.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('Unable to get your current location or destination.');
    }
  };

  // Fetch user's location when the component mounts
  useEffect(() => {
    getUserLocation();
  }, []); // Run only once on mount

  return (
    <div style={{display: 'flex', alignItems:'center', flexDirection: 'column',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw'
    }}>
      <h1 style={{textAlign:'center'}}
      >Navigate to Parking Slot</h1><br />
      <h5 style={{textAlign:'center'}}>
        Selected Slot: {slotId || 'None'} (Destination: `{destination ? `${destination.latitude}, ${destination.longitude}` : 'Not fetched yet'}`)
      </h5><br />
      <div style={{ textAlign: 'center' }}>
      <button
        onClick={openGoogleMaps}
        style={{
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginRight: '10px',
        }}
      >
        Get Directions
      </button>
      <button
        onClick={fetchDestination}
        style={{
          padding: '10px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Fetch Destination
      </button>
      </div>
      <br />
      <div style={{textAlign: 'center'}}>
      <label >
        Change Slot ID:
        <input
          type="text"
          value={slotId}
          onChange={(e) => setSlotId(e.target.value.trim())} // Trim to avoid accidental spaces
          style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
        />
      </label>
      </div>
    </div>
  );
}


