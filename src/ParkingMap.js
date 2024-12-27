import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faRoad } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { VehicleSelector } from "./VehicleSelector";
import { Modal, Button } from "react-bootstrap";
import { SlotDetailsModal } from "./SlotDetailsModal";
import emailjs from 'emailjs-com'; // Import EmailJS

// Styled Components (same as in your code)
const ParkingMapContainer = styled.div`
  padding: 20px;
  background-color: #f7f7f7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, #ff9a8b, #ff5847);
  color: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 18px 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #fff;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 1400px;
  margin-top: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SlotCard = styled.div`
  position: relative;
  background: ${(props) => (props.available ? "#96e6a1" : "#f1c4c4")};
  color: #333;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: 0.3s ease;
  overflow: hidden;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
   height: auto;
  overflow: visible;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const SlotTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 2px;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const SlotInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap:2px;
   flex-grow: 1;
   margin-bottom: 5px;
`;

const SlotInfo = styled.p`
  font-size: 1rem;
  color: ${(props) => (props.available ? "#555" : "#777")};
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const SlotButton = styled.button`
  background-color: ${(props) => (props.available ? "#388e3c" : "#e74c3c")};
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  transition: 0.3s ease;
  width: 100%;


  &:hover {
    background-color: ${(props) => (props.available ? "#2e7d32" : "#c0392b")};
    transform: scale(1.05);
  }

  ${(props) => !props.available && "pointer-events: none; opacity: 0.7;"}

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const AvailabilityIcon = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.5rem;
  color: ${(props) => (props.available ? "#2e7d32" : "#c62828")};

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;


export const ParkingMap = () => {
  const params = useParams();
  const { floorNumber } = params; // Get the floor number from the URL
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const vehicleType = selectedVehicle;
  const [selectedSlot, setSelectedSlot] = useState(null); // To track the selected slot for booking
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [showBookNowModal, setShowBookNowModal] = useState(false);
  const [duration, setDuration] = useState(""); // Duration input
  const [totalAmount, setTotalAmount] = useState(null); // Total calculated amount
  const navigate = useNavigate();
  const [slotDetails, setSlotDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null); // Payment details from database
  const [clicked, setClicked] = useState(false);

  //set slots acc to vehicle chosen
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const floorNumber = parseInt(params.floorNumber);
        if (isNaN(floorNumber) || floorNumber < 1) {
          setError("Invalid floor number");
          return;
        }
        const response = await axios.get(
          `http://localhost:3001/api/smart-parking-system/parkingslots/${floorNumber}?vehicleType=${selectedVehicle}`
        );
        console.log("API Response:", response.data);
        setSlots(response.data.map((slot) => ({ ...slot, showMore: false })));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [params.floorNumber, selectedVehicle]);

  useEffect(() => {
    console.log("Selected Vehicle:", selectedVehicle);
    console.log("Slots:", slots);
  }, [slots, selectedVehicle]);
  

  const handleBookNowClick = (slot) => {
    setSelectedSlot(slot);
    console.log(slot);
    setShowBookNowModal(true);
  };

  const handleViewMoreClick = (slot) => {
    setSelectedSlot(slot);
    setShowViewMoreModal(true);
  };

  const handleCalculateCharge = async () => {
    if (!duration || isNaN(duration) || duration <= 0) {
      alert("Please enter a valid duration in hours.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/parking-slots/calculate-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot?.slotId, duration }),
        
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Charge response:', data);
        setTotalAmount(data.totalAmount);
         // Fetch payment details from database
         fetchPaymentDetails();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); 
        setError(errorData.error || 'Failed to calculate charge.');
      }
    } catch (error) {
      console.error('API Error:', error); 
      setError('Failed to calculate charge. Please try again.');
    }
  };

    // Function to fetch payment details from database
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch('http://localhost:3001/paymentDetailsDB/payments');
        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data);
        } else {
          setError('Failed to fetch payment details.');
        }
      } catch (error) {
        setError('Failed to fetch payment details. Please try again.');
      }
    };

       const fetchSlotDetails = async (slotId) => {
        setError(null);
        setSlotDetails(null);
        setTotalAmount(null);

      try {
    const response = await fetch(`http://localhost:3001/api/parking-slots/${slotId}`);
    if (response.ok) {
      const data = await response.json();
      setSlotDetails(data);
      setSelectedSlot(slotId);
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Slot not found.');
    }
  } catch (error) {
    setError('Failed to fetch slot details. Please try again.');
  }
};
    

  
  const handleBookSlot = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/parkingslots/${selectedSlot?.slotId}/book`,
        { duration }
      );
  
    //   if (response.data.success) {
  
        // Navigate to the payment page
        navigate('/private/payment', {
          state: {
            totalAmount: totalAmount,
            slotId: selectedSlot?.slotId,
            duration: duration,
            floorNumber: selectedSlot?.floorNumber,
            building: selectedSlot?.building,
             
          },
        });
      //  else {
      //   alert("Failed to book slot. Please try again.");
      // }
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("An error occurred during booking. Please try again.");
    }
  };
  


  const closeBookNowModal = () => {
  setShowBookNowModal(false);
  setTotalAmount(null); // Clear total amount
  setDuration("");      // Clear duration input
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const slotSize =
    selectedVehicle === "Bike"
      ? "Small"
      : selectedVehicle === "Car"
      ? "Medium"
      : selectedVehicle === "Truck"
      ? "Large"
      : "Medium";

  return (
    <ParkingMapContainer>
      <Header>
        <Title>Parking Slots - Floor {floorNumber}</Title>
      </Header>
      <VehicleSelector
        onVehicleChange={(vehicle) => setSelectedVehicle(vehicle)}
        selectedVehicle={selectedVehicle}
      />
      <SlotGrid>
        {slots
          .filter((slot) => slot.slotSize === slotSize) // Filter slots by size
          .map((slot) => (
            <SlotCard key={slot.slotId} available={slot.status === "Available"}>
              <AvailabilityIcon available={slot.status === "Available"}>
                <FontAwesomeIcon
                  icon={slot.status === "Available" ? faRoad : faCar}
                />
              </AvailabilityIcon>
              <SlotInfoContainer>
                <SlotTitle>{slot.slotId}</SlotTitle>
                <SlotInfo>{slot.Proximity_to_landmarks}</SlotInfo>
                <SlotInfo>Price: ${slot.price}</SlotInfo>
                <Button variant="link" onClick={() => handleViewMoreClick(slot)}>
                  {slot.showMore ? 'View Less' : 'View More'}
                 </Button>
              </SlotInfoContainer>
              <SlotButton
                available={slot.status === "Available"}
                onClick={() => handleBookNowClick(slot)}
              >
                {slot.status === "Booked" ? "Booked" : "Book Now"}
              </SlotButton>
            </SlotCard>
          ))}
      </SlotGrid>
      {selectedSlot && (
        <SlotDetailsModal
           show={showViewMoreModal}
          onHide={() => setShowViewMoreModal(false)}
          slot={selectedSlot} /> )}

      {/* Modal */}
      
      <Modal show={showBookNowModal} onHide={closeBookNowModal}  centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Slot: {selectedSlot?.slotId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        
        <form className="slot-form">
             <label>
              Slot ID:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.slotId} readOnly />
            </label>
            <label> 
              Floor Number:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.floorNumber} readOnly />
            </label>
            <label>
              Building:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.building} readOnly />
            </label>
            <label>
              Zone:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.zone} readOnly />
            </label>
            <label>
              Row:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.row} readOnly />
            </label>
            <label>
              Column:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.column} readOnly />
            </label>
            <label>
              Proximity to Landmarks:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.Proximity_to_landmarks} readOnly />
            </label>
            <label>
              Slot Type:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.slotType} readOnly />
            </label>
            <label>
              Slot Size:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.slotSize} readOnly />
            </label>
            <label> 
              Status:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.status} readOnly />
            </label>
            <label>
              Hourly Rate:
              <input type="text" style={{margin: '7px'}} value={selectedSlot?.hourlyRate} readOnly />
            </label>
            <div className="calculate-charge">
        <label>
          Parking Duration (hours): 
          <input 
            type="number" style={{margin: '7px'}}
            placeholder="Enter duration in hours" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
          />
        </label>

      </div>
      {totalAmount !== null && totalAmount > 0  &&(
        <p className="total-amount">Total Amount: ${totalAmount}</p>
      )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookNowModal(false)}>
            Close
          </Button>
          <Button variant="info" onClick={handleCalculateCharge}>
            Calculate Charge
          </Button>
          <Button
            variant="success"
            onClick={handleBookSlot}
            disabled={!duration || !totalAmount}
          >
            Confirm Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </ParkingMapContainer>
  );
};
