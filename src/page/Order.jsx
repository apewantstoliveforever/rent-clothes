import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Modal from 'react-modal';
import { getDatabase, ref, onValue } from "firebase/database";
import { deleteDoc, onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";
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


  // const [genderFilter, setGenderFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setcolorFilter] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [bill, setBill] = useState('');

  const [billInfoForPrint, setBillInfoForPrint] = useState({});

  const handleChangeName = (e) => {
    setCustomerName(e.target.value);
  };
  const handleChangeNumber = (e) => {
    setCustomerNumber(e.target.value);
  };
  const handleChangeAddress = (e) => {
    setCustomerAddress(e.target.value);
  };

  const handleChooseOption = (id, option) => {
    const cloth = chosenClothes.find((c) => c.id === id);
    const clothRow = document.querySelector(`tr[row="row-${id}"]`);
    if (clothRow) {
      clothRow.style.backgroundColor = option ? 'lightgreen' : 'white';
    }
    if (!cloth) {
      setChosenClothes([...chosenClothes, { id, option }]);
      console.log(chosenClothes);
      setTotalPrice(totalPrice + clothes.find((c) => c.id === id).RentalFee + clothes.find((c) => c.id === id).Deposit);
    } else {
      if (!option) {
        setChosenClothes(chosenClothes.filter((c) => c.id !== id));
        setTotalPrice(totalPrice - clothes.find((c) => c.id === id).RentalFee - clothes.find((c) => c.id === id).Deposit);
      } else {
        setChosenClothes(chosenClothes.map((c) => (c.id === id ? { ...c, option } : c)));
        setTotalPrice(totalPrice + clothes.find((c) => c.id === id).RentalFee + clothes.find((c) => c.id === id).Deposit);
      }
    }
  };

  const handleFilter = async (type, value) => {
    console.log(type, value);
    // const updatedFilters = { ...filters, [type]: value };
    // setFilters(updatedFilters);
    // if (type === 'genderFilter') {
    //   setGenderFilter(value);
    //   console.log(genderFilter)
    // } else 
    if (type === 'sizeFilter') {
      setSizeFilter(value);
      console.log(sizeFilter)
    }
    else if (type === 'colorFilter') {
      setcolorFilter(value);
      console.log('Color filter:', value);
    }

  };



  const handleOrder = () => {
    // let totalPrice = 0;
    chosenClothes.forEach((cloth) => {
      const clothObj = clothes.find((c) => c.id === cloth.id);
      // totalPrice += clothObj.RentalFee + clothObj.Deposit;
      // console.log(totalPrice);
    });
    // setTotalPrice(totalPrice);
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

  const handleDeleteOrder = () => {
    chosenClothes.forEach((cloth) => {
      const clothRow = document.querySelector(`tr[row="row-${cloth.id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'white';
      }
    });
    //delete order from firestore
    const clothesCollectionRef = collection(firestore, 'clothes');
    chosenClothes.forEach((clothe) => {
      const clothesId = clothe.id;
      const docPath = String(clothesId); // Ensure clothesId is converted to string
      try {
        updateDoc(doc(clothesCollectionRef, docPath), {
          Available: true
        });
        console.log(`Clothes with ID ${clothesId} availability updated.`);
      } catch (error) {
        console.error(`Error updating availability for clothes with ID ${clothesId}: ${error}`);
      }
    });
    //delete bill from firestore
    const BillRef = collection(firestore, 'bills');
    try {
      deleteDoc(doc(BillRef, bill));
      console.log('Bill deleted');
    } catch (error) {
      console.error('Error deleting bill: ', error.message);
    }
    setChosenClothes([]);
    setTotalPrice(0);
    setIsOrderPlaced(false);
    setIsBillPrintable(false);
    setIsModalOpen(false);
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

  useEffect(() => {
    console.log(sizeFilter, colorFilter);
    const fetchClothes = async () => {
      if (sizeFilter === '' && colorFilter === '') {
        const q = query(collection(firestore, "clothes"));
        const querySnapshot = await getDocs(q);
        const clothesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClothes(clothesList);
        return;
      }
      let q = collection(firestore, "clothes");
      if (sizeFilter !== '') {
        q = query(q, where("Size", "==", sizeFilter));
      }
      if (colorFilter !== '') {
        q = query(q, where("Color", "==", colorFilter));
      }
      const querySnapshot = await getDocs(q);
      const clothesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClothes(clothesList);
    };
    fetchClothes();
  }, [sizeFilter, colorFilter]);


  const PrintModalContent = () => {
    const TotalRentFee = chosenClothes.reduce((acc, cloth) => {
      const clothObj = clothes.find((c) => c.id === cloth.id);
      return acc + clothObj.RentalFee;
    }, 0);
    const TotalDepositFee = chosenClothes.reduce((acc, cloth) => {
      const clothObj = clothes.find((c) => c.id === cloth.id);
      return acc + clothObj.Deposit;
    }, 0);
    const TotalPrice = TotalRentFee + TotalDepositFee;
    return (
      <div>
        <img src="b2.png" alt="Kalynn.store" style={{ width: '25%', float: 'right' }} />
        <div className='print-customer-info' style={{display: 'none'}}>
          <p><strong>Tên Khách hàng:</strong> {customerName} <strong>Số điện thoại:</strong> {customerNumber}</p>
          <p><strong>Địa chỉ:</strong> {customerAddress}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Số thứ tự</th>
              <th>Màu sắc</th>
              <th>Sản phẩm</th>
              <th>Size</th>
              <th>Tiền Thuê</th>
              <th>Đặt cọc</th>
            </tr>
          </thead>
          <tbody>
            {chosenClothes.map((cloth, index) => {
              const clothObj = clothes.find((c) => c.id === cloth.id);
              return (
                <tr key={cloth.id}>
                  <td>{index + 1}</td>
                  <td>{clothObj.Color}</td>
                  <td>{clothObj.Type}</td>
                  <td>{clothObj.Size}</td>
                  <td>{clothObj.RentalFee} đồng</td>
                  <td>{clothObj?.Deposit} đồng</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '12px', marginRight: '20px', textAlign: 'right' }}><strong>Total Price:</strong>  {TotalPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</p>
        <div className='print-non-display' style={{ display: 'none' }}>
          <table style={{ borderCollapse: 'collapse', width: '50%', margin: '4px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f' }}>
                <th style={{ border: '1px solid black', padding: '5px', height: '35px' }}>Ngày giao</th>
                <th style={{ border: '1px solid black', padding: '5px', height: '35px' }}>Ngày trả</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}></td>
                <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}></td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid black', borderBottom: '1px solid black', fontSize: '8px' }}>
            <ul>
              <li>Lưu ý cọc không hủy</li>
              <li>Chỉ giao khi nhận đủ cọc</li>
              <li>Xác nhận tình trạng váy sau 15 phút nhận đồ, sau 15 phút không nhận xử lý</li>
              <li>Phí thuê thêm ngày 10%</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const handlePrintBill = () => {
    const printContent = ReactDOMServer.renderToStaticMarkup(<PrintModalContent />); // Render as JSX component
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kalynn.store ☏ 070.459.2839</title>
          <style>
            /* CSS styles for printing */
            @page { size: A5 landscape; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 5px; font-size: 12px; }
            ul { display: block; }
            p { display: block; }
          </style>
        </head>
        <body>
          <div>
            ${printContent}
          </div>
          <!-- Rest of your printing logic... -->
        </body>
      </html>
    `);
    const importantNote = printWindow.document.querySelector('.print-non-display');
    if (importantNote) {
      importantNote.style.display = 'block';
    }
    const customerInfo = printWindow.document.querySelector('.print-customer-info');
    if (customerInfo) {
      customerInfo.style.display = 'block';
    }
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
      Name: customerName,
      Number: customerNumber,
      Address: customerAddress,
      TotalPrice: totalPrice,
      Date: timeStamps,
      clothesRented: clothesRented,
      Returned: false
    };


    try {
      await addDoc(BillRef, newBill)
        .then((docRef) => {
          console.log("Bill written with ID: ", docRef.id);
          setBill(docRef.id);
        });
      console.log('New bill added');
      //add Bill infor for print
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
            <th>Brand</th>
            <th>Color</th>
            <th>Type</th>
            <th>Rental Fee</th>
            <th>Deposit</th>
            <th>Size</th>
            {/* <th>Gender</th> */}
            <th>Action</th>
          </tr>
          <tr>
            <td colSpan="6" style={{ backgroundColor: '#f2f2f2', padding: '5px' }}>
              <strong>Filter:</strong>&nbsp;
              {/* Gender:
              <select onChange={(e) => handleFilter('genderFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Unisex">Unisex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              &nbsp; */}
              Size:
              <select onChange={(e) => handleFilter('sizeFilter', e.target.value)}>
                <option value="">All</option>
                <option value="S">S</option>
                <option value="XS">XS</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              Color:
              <select name="Color" onChange={(e) => handleFilter('colorFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Grey">Grey</option>
                <option value="Brown">Brown</option>
                <option value="Purple">Purple</option>
                <option value="Pink">Pink</option>
                <option value="Orange">Orange</option>
                <option value="Cyan">Cyan</option>
                <option value="Magenta">Magenta</option>
                <option value="Lime">Lime</option>
                <option value="Teal">Teal</option>
                <option value="Indigo">Indigo</option>
                <option value="Violet">Violet</option>
                <option value="Fuchsia">Fuchsia</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
                <option value="Other">Khác</option>
              </select>
            </td>
          </tr>
        </thead>
        <tbody>
          {clothes.map((cloth) => (
            <tr row={`row-${cloth.id}`} key={cloth.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><img src={cloth.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /></td>
              <td>{cloth.Brand}</td>
              <td>{cloth.Color}</td>
              <td>{cloth.Type}</td>
              <td>{cloth.RentalFee} đồng</td>
              <td>{cloth.Deposit} đồng</td>
              <td>{cloth.Size}</td>
              {/* <td>{cloth.Gender}</td> */}
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
          Họ tên:
          <input type="text" name="Name" onChange={handleChangeName} />
        </label>
        <label style={{ margin: '5px' }}>
          Số điện thoại:
          <input type="number" name="Number" onChange={handleChangeNumber} />
        </label>
        <address style={{ margin: '5px' }}>
          Địa chỉ:
          <textarea type="text" name="Address" onChange={handleChangeAddress} />
        </address>
        <p><strong>Tổng số tiền:</strong> {totalPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</p>
        <button onClick={handlePlaceOrder} disabled={isOrderPlaced}>Đặt Hàng</button>
        <button onClick={handlePrintBill} disabled={!isBillPrintable}>In Bill</button>
        <button onClick={closeModal}>Close</button>
        <button onClick={handleDeleteOrder} disabled={isOrderPlaced}>Delete Order</button>
      </Modal>
    </div>
  );
};

export default Order;
