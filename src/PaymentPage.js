// import React, { useState, useEffect } from "react";
// import { QRCodeCanvas } from 'qrcode.react';
// import { useNavigate } from "react-router-dom";
// import emailjs from 'emailjs-com';

// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Card,
//   CardContent,
//   CardActions,
// } from "@mui/material";

// export const  PaymentPage = () => {
//   const navigate = useNavigate();
//   const [selectedOption, setSelectedOption] = useState("");
//   const [cardHolderName, setCardHolderName] = useState("");
//   const [cardNumber, setCardNumber] = useState("");
//   const [expiryDate, setExpiryDate] = useState("");
//   const [cvv, setCvv] = useState("");
//   const [paypalEmail, setPaypalEmail] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [errors, setErrors] = useState({});
//   const [isValid, setIsValid] = useState(false);
//   const [accountDetails, setAccountDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const paymentOptions = [
//     { id: "credit_card", label: "Credit Card" },
//     { id: "debit_card", label: "Debit Card" },
//     { id: "paypal", label: "PayPal" },
//     { id: "upi", label: "UPI" },
//   ];

//   const qrCodeValue = '1654987666612875411';

//   // Fetch account details based on payment method
//   const handleOptionSelect = async (paymentMethod) => {
//     setSelectedOption(paymentMethod);
//     setLoading(true);
//     setErrorMessage("");
//     try {
//       const response = await fetch(`http://localhost:3001/api/account/${paymentMethod}`);
//       const data = await response.json();
//       if (data.accountDetails) {
//         setAccountDetails(data.accountDetails);
//       } else {
//         setErrorMessage("Account details not found");
//       }
//     } catch (error) {
//       setErrorMessage("Error fetching account details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Form validation
//   const validateForm = () => {
//     const errors = {};
//     if (selectedOption === "credit_card" || selectedOption === "debit_card") {
//       if (!cardHolderName) {
//         errors.cardHolderName = "Card holder name is required";
//       }
//       if (!cardNumber) {
//         errors.cardNumber = "Card number is required";
//       } else if (!/^\d{16}$/.test(cardNumber)) {
//         errors.cardNumber = "Invalid card number";
//       }
//       if (!expiryDate) {
//         errors.expiryDate = "Expiry date is required";
//       } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
//         errors.expiryDate = "Invalid expiry date";
//       }
//       if (!cvv) {
//         errors.cvv = "CVV is required";
//       } else if (!/^\d{3}$/.test(cvv)) {
//         errors.cvv = "Invalid CVV";
//       }
//     } else if (selectedOption === "paypal") {
//       if (!paypalEmail) {
//         errors.paypalEmail = "PayPal email is required";
//       } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(paypalEmail)) {
//         errors.paypalEmail = "Invalid PayPal email";
//       }
//     } else if (selectedOption === "upi") {
//       if (!upiId) {
//         errors.upiId = "UPI ID is required";
//       } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
//         errors.upiId = "Invalid UPI ID";
//       }
//     }
//     setErrors(errors);
//     setIsValid(Object.keys(errors).length === 0);
//   };


//   const handleSubmit = async () => {
//     if (isValid) {
//       try {
//         // Save payment details to the database
//         const saveResponse = await fetch("http://localhost:3001/api/savePayment", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             paymentMethod: selectedOption,
//             cardHolderName,
//             cardNumber,
//             expiryDate,
//             cvv,
//             paypalEmail,
//             upiId,
//           }),
//         });
//         const saveResult = await saveResponse.json();
  
//         if (!saveResult.success) {
//           alert("Failed to save payment details: " + saveResult.message);
//           return;
//         }
  
//         alert("Payment details saved successfully!");
  
//         // Validate payment details
//         const validateResponse = await fetch("http://localhost:3001/api/validateAccount", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             paymentMethod: selectedOption,
//             details: accountDetails, // Pass the required validation details
//           }),
//         });
//         const validateResult = await validateResponse.json();
  
//         if (validateResult.success) {
//           alert("Payment successful!");
//         } else {
//           alert("Payment failed: " + validateResult.message);
//         }
//         navigate("/private/location");
//       } catch (error) {
//         alert("An error occurred: " + error.message);
//       }
//     }
//   };
  


//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     switch (name) {
//       case "cardHolderName":
//         setCardHolderName(value);
//         break;
//       case "cardNumber":
//         setCardNumber(value);
//         break;
//       case "expiryDate":
//         setExpiryDate(value);
//         break;
//       case "cvv":
//         setCvv(value);
//         break;
//       case "paypalEmail":
//         setPaypalEmail(value);
//         break;
//       case "upiId":
//         setUpiId(value);
//         break;
//       default:
//         break;
//     }
//     validateForm();
//   };

//   const renderFormFields = () => {
//     switch (selectedOption) {
//       case "credit_card":
//       case "debit_card":
//         return (
//           <>
//                        <TextField
//               fullWidth
//               label="Card Holder Name"
//               variant="outlined"
//               sx={{ mb: 2 }}
//               name="cardHolderName"
//               value={cardHolderName}
//               onChange={handleInputChange}
//               error={errors.cardHolderName ? true : false}
//               helperText={errors.cardHolderName}
//             />
//             <TextField
//               fullWidth
//               label="Card Number"
//               variant="outlined"
//               type="number"
//               sx={{ mb: 2 }}
//               name="cardNumber"
//               value={cardNumber}
//               onChange={handleInputChange}
//               error={errors.cardNumber ? true : false}
//               helperText={errors.cardNumber}
//             />
//             <TextField
//               fullWidth
//               label="Expiry Date (MM/YY)"
//               variant="outlined"
//               sx={{ mb: 2 }}
//               name="expiryDate"
//               value={expiryDate}
//               onChange={handleInputChange}
//               error={errors.expiryDate ? true : false}
//               helperText={errors.expiryDate}
//             />
//             <TextField
//               fullWidth
//               label="CVV"
//               variant="outlined"
//               type="password"
//               sx={{ mb: 2 }}
//               name="cvv"
//               value={cvv}
//               onChange={handleInputChange}
//               error={errors.cvv ? true : false}
//               helperText={errors.cvv}
//             />
//           </>
//         );
//       case "paypal":
//         return (
//           <>
//             <TextField
//               fullWidth
//               label="PayPal Email Address"
//               variant="outlined"
//               sx={{ mb: 2 }}
//               name="paypalEmail"
//               value={paypalEmail}
//               onChange={handleInputChange}
//               error={errors.paypalEmail ? true : false}
//               helperText={errors.paypalEmail}
//             />
//           </>
//         );
//       case "upi":
//         return (
          
//           <>
//           <div style={{ width: '80%', margin: '40px auto', textAlign: 'center' }}>
//       <h2>QR Code Display</h2>
//       <QRCodeCanvas
//         value={qrCodeValue}
//         size={256}
//         style={{ margin: '0 auto', display: 'block' }}
//       />
//     </div>
//             <TextField
//               fullWidth
//               label="UPI ID"
//               variant="outlined"
//               sx={{ mb: 2 }}
//               name="upiId"
//               value={upiId}
//               onChange={handleInputChange}
//               error={errors.upiId ? true : false}
//               helperText={errors.upiId}
//             />
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background: "linear-gradient(to bottom, #ffcbff, #c1d2dc)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         p: 2,
//       }}
//     >
//       <Card
//         sx={{
//           maxWidth: 600,
//           width: "100%",
//           backgroundColor: "rgba(255, 255, 255, 0.9)",
//           borderRadius: 4,
//           boxShadow: 5,
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         <CardContent>
//           <Typography
//             variant="h4"
//             align="center"
//             gutterBottom
//             sx={{ fontWeight: "bold", color: "#333" }}
//           >
//             Payment Method
//           </Typography>

//           {!selectedOption ? (
//             <Box sx={{ mb: 3 }}>
//               <Typography
//                 variant="body1"
//                 align="center"
//                 gutterBottom
//                 sx={{ mb: 3, color: "#555" }}
//               >
//                 Select a payment method to proceed.
//               </Typography>
//               {paymentOptions.map((option) => (
//                 <Card
//                   key={option.id}
//                   sx={{
//                     cursor: "pointer",
//                     backgroundColor: "rgba(255, 255, 255, 0.8)",
//                     color: "#333",
//                     textAlign: "center",
//                     mb: 2,
//                     p: 2,
//                     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//                     borderRadius: 3,
//                     transition: "all 0.3s ease",
//                     ":hover": {
//                       background: "linear-gradient(to right, #ffcbff, #c1d2dc)",
//                       color: "#fff",
//                       boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
//                       transform: "translateY(-2px)",
//                     },
//                   }}
//                   onClick={() => handleOptionSelect(option.id)}
//                 >
//                   <Typography variant="h6">{option.label}</Typography>
//                 </Card>
//               ))}
//             </Box>
//           ) : (
//             <Box>
//               <Typography
//                 variant="h5"
//                 align="center"
//                 gutterBottom
//                 sx={{ fontWeight: "bold", color: "#555", mb: 3 }}
//               >
//                 {paymentOptions.find((opt) => opt.id === selectedOption)?.label}
//               </Typography>
//               {accountDetails && !loading && (
//                                 <Box sx={{ mb: 3 }}>
//                                 <Typography variant="body1" sx={{ fontWeight: "bold" }}>
//                                   To:
//                                 </Typography>
//                                 <Typography variant="body2">Account Number: {accountDetails}</Typography>
//                                 {/* <Typography variant="body2">Account Name: {accountDetails.accountName}</Typography>
//                                 <Typography variant="body2">IFSC Code: {accountDetails.ifscCode}</Typography>
//                                 <Typography variant="body2">Bank Name: {accountDetails.bankName}</Typography> */}
//                               </Box>
//                             )}
//                             {loading && <Typography variant="body2">Loading account details...</Typography>}
//                             {errorMessage && <Typography variant="body2" color="error">{errorMessage}</Typography>}
//                             {renderFormFields()}
//                           </Box>
//                         )}
//                       </CardContent>
//                       <CardActions sx={{ justifyContent: "center" }}>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={handleSubmit}
//                           disabled={!isValid}
//                         >
//                           Submit Payment
//                         </Button>
//                       </CardActions>
//                     </Card>
//                   </Box>
//                 );
//               };
              

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation,useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';

import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

export const  PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { duration, totalAmount, slotId, floorNumber, building } = state || {};
  const [selectedOption, setSelectedOption] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);

  console.log('Duration from location state:', duration);
 


  const paymentOptions = [
    { id: "credit_card", label: "Credit Card" },
    { id: "debit_card", label: "Debit Card" },
    { id: "paypal", label: "PayPal" },
    { id: "upi", label: "UPI" },
  ];

  //const qrCodeValue = '1654987666612875411';
  const qrCodeValue = '';

  // Fetch account details based on payment method
  const handleOptionSelect = async (paymentMethod) => {
    setSelectedOption(paymentMethod);
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`http://localhost:3001/api/account/${paymentMethod}`);
      const data = await response.json();
      if (data.accountDetails) {
        setAccountDetails(data.accountDetails);
      } else {
        setErrorMessage("Account details not found");
      }
    } catch (error) {
      setErrorMessage("Error fetching account details");
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (selectedOption === "credit_card" || selectedOption === "debit_card") {
      if (!cardHolderName) {
        errors.cardHolderName = "Card holder name is required";
      }
      if (!cardNumber) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber)) {
        errors.cardNumber = "Invalid card number";
      }
      if (!expiryDate) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors.expiryDate = "Invalid expiry date";
      }
      if (!cvv) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3}$/.test(cvv)) {
        errors.cvv = "Invalid CVV";
      }
    } else if (selectedOption === "paypal") {
      if (!paypalEmail) {
        errors.paypalEmail = "PayPal email is required";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(paypalEmail)) {
        errors.paypalEmail = "Invalid PayPal email";
      }
    } else if (selectedOption === "upi") {
      if (!upiId) {
        errors.upiId = "UPI ID is required";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
        errors.upiId = "Invalid UPI ID";
      }
    }
    setErrors(errors);
    setIsValid(Object.keys(errors).length === 0);
  };


  const handleSubmit = async () => {
    if (!isValid) {
      alert("Please ensure all payment fields are valid.");
      return;
    }
  
    try {
      // Save payment details to the database
      const saveResponse = await fetch("http://localhost:3001/api/savePayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: selectedOption,
          cardHolderName,
          cardNumber,
          expiryDate,
          cvv,
          paypalEmail,
          upiId,
        }),
      });
  
      const saveResult = await saveResponse.json();
  
      if (!saveResult.success) {
        alert("Failed to save payment details: " + saveResult.message);
        return;
      }
  
      alert("Payment details saved successfully!");
  
      // Validate payment details
      // const validateResponse = await fetch("http://localhost:3001/api/validateAccount", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     paymentMethod: selectedOption,
      //     details: {
      //       cardHolderName,
      //       cardNumber,
      //       expiryDate,
      //       cvv,
      //       paypalEmail,
      //       upiId,
      //     },
      //   }),
      // });
  
      // const validateResult = await validateResponse.json();
      // console.log(validateResponse);
  
      // if (!validateResult.success) {
      //   alert("Payment failed: " + validateResult.message);
      //   return;
      // }
  
      alert("Payment successful!");
  
      // Set payment details after successful validation
      setPaymentDetails({
        paymentMethod: selectedOption,
        duration,
        ...saveResult.details, // Include other payment-related details if returned
      });
  
      // Track parking duration
      const parkingStartTime = new Date(); // Capture start time
  
      const checkDuration = () => {
        const currentTime = new Date();
        const elapsedTime = (currentTime.getTime() - parkingStartTime.getTime()) / 1000; // Elapsed time in seconds
        const parkingDurationInSeconds = duration * 60;
  
        if (elapsedTime >= parkingDurationInSeconds) {
          console.log("Parking duration exceeded!");
          clearInterval(parkingDurationChecker); // Stop checking
          sendEmailNotification(); // Notify the watchman
        } else {
          console.log("Parking duration not yet exceeded.");
        }
      };
  
      // Start interval to check parking duration
      const parkingDurationChecker = setInterval(checkDuration, 1000);
  
      // Navigate to the next page after successful payment and setup
      navigate("/private/location");
  
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };
  
  const handlePaymentSubmit = (paymentInfo, selectedDuration) => {
    console.log("Setting paymentDetails:", paymentInfo);
    setPaymentDetails(paymentInfo);
    console.log("Setting duration:", selectedDuration);
  };
  
  const updateSlotStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/update-slot-status?slotId=${slotId}`, {
        method: 'PUT',
      });
      const result = await response.json();
      console.log(result);
      if (result.success) {
        console.log('Slot status updated successfully!');
      } else {
        console.error('Failed to update slot status:', result.message);
      }
    } catch (error) {
      console.error('Error updating slot status:', error);
    }
  };
  
  useEffect(() => {
    console.log("paymentDetails:", paymentDetails);
    console.log("duration:", duration);
    if (!paymentDetails || !duration) {
      console.log("Waiting for payment details and duration.");
      return;
    }
    console.log("Payment details and duration are available.");
  }, [paymentDetails, duration]);
  
  const sendEmailNotification = () => {
    console.log("Sending email notification..."); // Add this line for debugging
    const templateParams = {
      to_name: 'shivani',
      to_email: 'shivani18905@example.com',
      subject: 'Parking Duration Exceeded',
      slot_id: slotId,
    floor_number: floorNumber,
    building: building,
    cta_url: `http://192.168.140.218:3001/api/update-slot-status?slotId=${slotId}`,
    };
  
    emailjs.send(
      'service_aupgsok', 
      'template_jt6u8k9', 
      templateParams, 
      '-MWalAz-c6Je-fdV7'
    ).then(
      (response) => {
        console.log('Email sent successfully:', response.status, response.text);
      },
      (err) => {
        console.log('Error sending email:', err);
      }
    );
  };

  const onPaymentSubmit = () => {
    const paymentInfo = { user: 'User1', amount: 100 }; // Example payment data
    const selectedDuration = 30; // Example: 30 minutes
    handlePaymentSubmit(paymentInfo, selectedDuration);
  };
  
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "cardHolderName":
        setCardHolderName(value);
        break;
      case "cardNumber":
        setCardNumber(value);
        break;
      case "expiryDate":
        setExpiryDate(value);
        break;
      case "cvv":
        setCvv(value);
        break;
      case "paypalEmail":
        setPaypalEmail(value);
        break;
      case "upiId":
        setUpiId(value);
        break;
      default:
        break;
    }
    validateForm();
  };

  const renderFormFields = () => {
    switch (selectedOption) {
      case "credit_card":
      case "debit_card":
        return (
          <>
                       <TextField
              fullWidth
              label="Card Holder Name"
              variant="outlined"
              sx={{ mb: 2 }}
              name="cardHolderName"
              value={cardHolderName}
              onChange={handleInputChange}
              error={errors.cardHolderName ? true : false}
              helperText={errors.cardHolderName}
            />
            <TextField
              fullWidth
              label="Card Number"
              variant="outlined"
              type="number"
              sx={{ mb: 2 }}
              name="cardNumber"
              value={cardNumber}
              onChange={handleInputChange}
              error={errors.cardNumber ? true : false}
              helperText={errors.cardNumber}
            />
            <TextField
              fullWidth
              label="Expiry Date (MM/YY)"
              variant="outlined"
              sx={{ mb: 2 }}
              name="expiryDate"
              value={expiryDate}
              onChange={handleInputChange}
              error={errors.expiryDate ? true : false}
              helperText={errors.expiryDate}
            />
            <TextField
              fullWidth
              label="CVV"
              variant="outlined"
              type="password"
              sx={{ mb: 2 }}
              name="cvv"
              value={cvv}
              onChange={handleInputChange}
              error={errors.cvv ? true : false}
              helperText={errors.cvv}
            />
          </>
        );
      case "paypal":
        return (
          <>
            <TextField
              fullWidth
              label="PayPal Email Address"
              variant="outlined"
              sx={{ mb: 2 }}
              name="paypalEmail"
              value={paypalEmail}
              onChange={handleInputChange}
              error={errors.paypalEmail ? true : false}
              helperText={errors.paypalEmail}
            />
          </>
        );
      case "upi":
        return (
          
          <>
          <div style={{ width: '80%', margin: '40px auto', textAlign: 'center' }}>
      <h2>QR Code Display</h2>
      <QRCodeCanvas
        value={qrCodeValue}
        size={256}
        style={{ margin: '0 auto', display: 'block' }}
       />

    </div>
            <TextField
              fullWidth
              label="UPI ID"
              variant="outlined"
              sx={{ mb: 2 }}
              name="upiId"
              value={upiId}
              onChange={handleInputChange}
              error={errors.upiId ? true : false}
              helperText={errors.upiId}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #ffcbff, #c1d2dc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 4,
          boxShadow: 5,
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Payment Method
          </Typography>

          {!selectedOption ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                align="center"
                gutterBottom
                sx={{ mb: 3, color: "#555" }}
              >
                Select a payment method to proceed.
              </Typography>
              {paymentOptions.map((option) => (
                <Card
                  key={option.id}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    color: "#333",
                    textAlign: "center",
                    mb: 2,
                    p: 2,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    ":hover": {
                      background: "linear-gradient(to right, #ffcbff, #c1d2dc)",
                      color: "#fff",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <Typography variant="h6">{option.label}</Typography>
                </Card>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#555", mb: 3 }}
              >
                {paymentOptions.find((opt) => opt.id === selectedOption)?.label}
              </Typography>
              {accountDetails && !loading && (
                                <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                  To:
                                </Typography>
                                <Typography variant="body2">Account Number: {accountDetails}</Typography>
                                {/* <Typography variant="body2">Account Name: {accountDetails.accountName}</Typography>
                                <Typography variant="body2">IFSC Code: {accountDetails.ifscCode}</Typography>
                                <Typography variant="body2">Bank Name: {accountDetails.bankName}</Typography> */}
                              </Box>
                            )}
                            {loading && <Typography variant="body2">Loading account details...</Typography>}
                            {errorMessage && <Typography variant="body2" color="error">{errorMessage}</Typography>}
                            {renderFormFields()}
                          </Box>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmit}
                          disabled={!isValid}
                        >
                          Submit Payment
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                );
              };
              

