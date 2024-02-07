import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Modal from 'react-modal';
import { getDatabase, ref, onValue } from "firebase/database";
import { onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";
import { firestore } from '../service/firebase';

Modal.setAppElement('#root');

const Order = () => {
  const [clothes, setClothes] = useState([]);
  const database = getDatabase();
  const [chosenClothes, setChosenClothes] = useState([]);
  const [countChosenClothes, setCountChosenClothes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isBillPrintable, setIsBillPrintable] = useState(false);


  const [genderFilter, setGenderFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');

  const handleChooseOption = (id, option) => {
    const cloth = chosenClothes.find((c) => c.id === id);
    const clothRow = document.querySelector(`tr[row="row-${id}"]`);
    if (clothRow) {
      clothRow.style.backgroundColor = option ? 'lightgreen' : 'white';
    }
    if (!cloth) {
      setChosenClothes([...chosenClothes, { id, option }]);
    } else {
      if (!option) {
        setChosenClothes(chosenClothes.filter((c) => c.id !== id));
      } else {
        setChosenClothes(chosenClothes.map((c) => (c.id === id ? { ...c, option } : c)));
      }
    }
  };

  const handleFilter = async (type, value) => {
    console.log(type, value);
    // const updatedFilters = { ...filters, [type]: value };
    // setFilters(updatedFilters);
    if (type === 'genderFilter') {
      setGenderFilter(value);
      console.log(genderFilter)
    } else if (type === 'sizeFilter') {
      setSizeFilter(value);
      console.log(sizeFilter)
    }
    console.log(genderFilter, sizeFilter);
  };

  const handleOrder = () => {
    let totalPrice = 0;
    chosenClothes.forEach((cloth) => {
      const clothObj = clothes.find((c) => c.id === cloth.id);
      totalPrice += clothObj.RentalFee;
    });
    setTotalPrice(totalPrice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (isOrderPlaced) {
      setChosenClothes([]);
      setTotalPrice(0);
      chosenClothes.forEach((cloth) => {
        const clothRow = document.querySelector(`tr[row="row-${cloth.id}"]`);
        if (clothRow) {
          clothRow.style.backgroundColor = 'white';
        }
      });
    }
    setIsOrderPlaced(false);
    setIsBillPrintable(false);
  };

  // const addClothingItem = async () => {
  //   try {
  //     const q = query(collection(firestore, "clothes"), where("Available", "==", true));
  //     const querySnapshot = await getDocs(q);
  //     const clothesList = querySnapshot.docs.map(doc => {
  //       return { id: doc.id, ...doc.data() };
  //     });
  //     return clothesList; // Return the clothesList
  //   } catch (error) {
  //     console.error('Error adding clothing item: ', error.message);
  //   }
  // };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clothes'), (snapshot) => {
      const clothesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClothes(clothesData);
    });
    // const fetchClothes = async () => {
    //   const items = await addClothingItem(); // Await the result of addClothingItem
    //   setClothes(items);
    // };
    // fetchClothes();
    return () => unsubscribe();
  }, []);

  const PrintModalContent = () => {
    return (
      <div>
        <h2>Order Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Size</th>
              <th>RentalFee</th>
            </tr>
          </thead>
          <tbody>
            {chosenClothes.map((cloth) => {
              const clothObj = clothes.find((c) => c.id === cloth.id);
              return (
                <tr key={cloth.id}>
                  <td>{clothObj.Type}</td>
                  <td>{clothObj.Size}</td>
                  <td>${clothObj.RentalFee}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>Total Price: ${totalPrice}</p>
      </div>
    );
  };

  const handlePrintBill = () => {
    const printContent = ReactDOMServer.renderToStaticMarkup(<PrintModalContent />); // Render as JSX component
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print</title></head><body>');
    printWindow.document.write('<div>');
    printWindow.document.write('<style> @page { size: A3 landscape; } table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid black; padding: 8px;}</style>'); // Set page size to A3 landscape
    printWindow.document.write(printContent);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
    closeModal();
    console.log('Print Bill');
  };

  const handlePlaceOrder = async () => {
    setIsOrderPlaced(true);
    setIsBillPrintable(true);
    console.log('Place Order');
    console.log(chosenClothes);

    const clothesCollectionRef = collection(firestore, 'clothes');

    // Loop through each chosenClothes and update its available status
    for (const clothe of chosenClothes) {
      const clothesId = clothe.id;
      const docPath = String(clothesId); // Ensure clothesId is converted to string
      try {
        await updateDoc(doc(clothesCollectionRef, docPath), {
          available: false
        });
        console.log(`Clothes with ID ${clothesId} availability updated.`);
      } catch (error) {
        console.error(`Error updating availability for clothes with ID ${clothesId}: ${error}`);
      }
    }
    //add new bill to firestore
    const BillRef = collection(firestore, 'bills');
    //array of clothes rented
    const clothesRented = chosenClothes.map((cloth) => {
      // const clothObj = clothes.find((c) => c.id === cloth.id);
      //update cloth in clothes collection to not available
      const clothRef = doc(firestore, 'clothes', cloth.id);
      updateDoc(clothRef, {
        Available: false
      });

      return { id: cloth.id, Returned: false };
    });
    const timeStamps = new Date();
    const newBill = {
      Name: 'Name',
      Number: 'Number',
      Address: 'Address',
      TotalPrice: totalPrice,
      Date: timeStamps,
      clothesRented: clothesRented,
      Returned: false
    };


    try {
      await addDoc(BillRef, newBill);
      console.log('New bill added');
    } catch (error) {
      console.error('Error adding new bill: ', error.message);
    }
  };

  const findAllClothes = async () => {
    const clothesRef = ref(database, 'clothes');
    onValue(clothesRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
    });
  };

  useEffect(() => {
    setCountChosenClothes(chosenClothes.length);
  }, [chosenClothes]);

  useEffect(() => {
    findAllClothes();
  }, []);

  return (
    <div>
      <h1>Order</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Type</th>
            <th>Rental Fee</th>
            <th>Size</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
          <tr>
            <td colSpan="6" style={{ backgroundColor: '#f2f2f2', padding: '8px' }}>
              <strong>Filter:</strong>&nbsp;
              Gender:
              <select onChange={(e) => handleFilter('genderFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Unisex">Unisex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              &nbsp;
              Size:
              <select onChange={(e) => handleFilter('sizeFilter', e.target.value)}>
                <option value="">All</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </td>
          </tr>
        </thead>
        <tbody>
          {clothes.map((cloth) => (
            <tr row={`row-${cloth.id}`} key={cloth.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><img src={cloth.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /></td>
              <td>{cloth.Type}</td>
              <td>${cloth.RentalFee}</td>
              <td>{cloth.Size}</td>
              <td>{cloth.Gender}</td>
              <td>
                {
                  cloth.Available ?
                    <select onChange={(e) => handleChooseOption(cloth.id, e.target.value)}>
                      <option value="">Choose an option</option>
                      <option value="option1">Choose</option>
                    </select> : <button disabled>Not Available</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleOrder}>Place Order {countChosenClothes}</button>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <PrintModalContent />
        <label style={{ margin: '5px' }}>
          Name:
          <input type="text" name="Name" />
        </label>
        <label style={{ margin: '5px' }}>
          Number:
          <input type="number" name="Number" />
        </label>
        <address style={{ margin: '5px' }}>
          Address:
          <input type="text" name="Address" />
        </address>
        <p>Total Price: ${totalPrice}</p>
        <button onClick={handlePlaceOrder} disabled={isOrderPlaced}>Place Order</button>
        <button onClick={handlePrintBill} disabled={!isBillPrintable}>Print Bill</button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Order;
