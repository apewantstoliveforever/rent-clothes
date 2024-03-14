import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Modal from 'react-modal';
import { getDatabase, ref, onValue } from "firebase/database";
import { deleteDoc, onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where } from "firebase/firestore";
import { firestore } from '../service/firebase';
import { set } from 'date-fns';

Modal.setAppElement('#root');

const Order = () => {
  const [clothes, setClothes] = useState([]);
  const database = getDatabase();
  const [chosenClothes, setChosenClothes] = useState([]);
  const [countChosenClothes, setCountChosenClothes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDepositFee, setTotalDepositFee] = useState(0);
  const [totalRentFee, setTotalRentFee] = useState(0);

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isBillPrintable, setIsBillPrintable] = useState(false);

  const [updateSelection, setUpdateSelection] = useState(false);


  // const [genderFilter, setGenderFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setcolorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [deliveryDate, setDeliveryDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

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

  const handleChangeDateSend = (e) => {
    setDeliveryDate(e.target.value);
  };
  const handleChangeDateReturn = (e) => {
    setReturnDate(e.target.value);
  };

  const handleChooseOption = (id, option) => {
    console.log('Cloth:', id, option);
    if (option === 'select') {
      if (!chosenClothes.includes(id)) {
        setChosenClothes([...chosenClothes, id]);
      }
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      clothRow.style.backgroundColor = 'lightgreen';
    }
    else {
      setChosenClothes(chosenClothes.filter((c) => c !== id));
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      clothRow.style.backgroundColor = 'white';
    }

    // if (option === 'select') {
    //   //check if the cloth is in array of chosenClothes return true false
    //   if (chosenClothes.includes(id)) {
    //     setChosenClothes([...chosenClothes, id]);
    //   }
    //   console.log('Cloth:', id, option);
    // }
    // else {
    //   //remove the cloth from array of chosenClothes
    // }

    // const clothRow = document.querySelector(`tr[row="row-${id}"]`);
    // if (clothRow) {
    //   clothRow.style.backgroundColor = chosenClothes.find(id) ? 'lightgreen' : 'white';
    // }

    // const cloth = chosenClothes.find((c) => c.id === id);
    // const clothRow = document.querySelector(`tr[row="row-${id}"]`);
    // if (clothRow) {
    //   clothRow.style.backgroundColor = option ? 'lightgreen' : 'white';
    // }
    // if (!cloth) {
    //   console.log('Cloth:', id, option);
    //   setChosenClothes([...chosenClothes, id]);
    // } else {
    //   if (!option) {
    //     setChosenClothes(chosenClothes.filter((c) => c.id !== id));
    //   } else {
    //     setChosenClothes(chosenClothes.map((c) => (c.id === id ? { ...c, option } : c)));
    //   }
    // }
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
    else if (type === 'typeFilter') {
      setTypeFilter(value);
      console.log('Type filter:', value);
    }
    else if (type === 'kindFilter') {
      setKindFilter(value);
      console.log('Type filter:', value);
    }

  };



  const handleOrder = () => {
    if (chosenClothes.length === 0) {
      alert('Chưa chọn sản phẩm nào');
      return;
    }
    // let totalPrice = 0;
    chosenClothes.forEach((id) => {
      const clothObj = clothes.find((c) => c.id === id);
      // totalPrice += clothObj.RentalFee + clothObj.Deposit;
      // console.log(totalPrice);
    });
    // setTotalPrice(totalPrice);
    setIsModalOpen(true);
  };

  const resetAllChosen = () => {
    chosenClothes.forEach((id) => {
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'white';
      }
    });
    setChosenClothes([]);
    setTotalPrice(0);
    setIsOrderPlaced(false);
    setIsBillPrintable(false);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    if (isOrderPlaced) {
      setChosenClothes([]);
      setTotalPrice(0);
      chosenClothes.forEach((id) => {
        const clothRow = document.querySelector(`tr[row="row-${id}"]`);
        if (clothRow) {
          clothRow.style.backgroundColor = 'white';
        }
      });
    }
    setIsOrderPlaced(false);
    setIsBillPrintable(false);
  };

  const handleDeleteOrder = () => {
    chosenClothes.forEach((id) => {
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'white';
      }
    });
    //delete order from firestore
    const clothesCollectionRef = collection(firestore, 'clothes');
    chosenClothes.forEach((id) => {
      const clothesId = id;
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
    setTotalDepositFee(0);
    setTotalRentFee(0);
    setIsOrderPlaced(false);
    setIsBillPrintable(false);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'clothes'), (snapshot) => {
      const clothesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClothes(clothesData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(chosenClothes);
  }, [chosenClothes]);

  useEffect(() => {
    console.log(sizeFilter, colorFilter);
    const fetchClothes = async () => {
      let q = collection(firestore, "clothes");

      const searchType = typeFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (sizeFilter !== '') {
        q = query(q, where("Size", "==", sizeFilter));
      }
      if (colorFilter !== '') {
        q = query(q, where("Color", "==", colorFilter));
      }
      if (typeFilter !== '') {
        q = query(q, where("Type", "==", typeFilter));
      }
      if (kindFilter !== '') {
        q = query(q, where("Kind", "==", kindFilter));
      }

      if (sizeFilter === '' && colorFilter === '' && typeFilter === '' && kindFilter === '') {
        q = collection(firestore, "clothes");
      }

      const querySnapshot = await getDocs(q);
      const clothesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(clothesList);
      setClothes(clothesList);
    };
    fetchClothes();
    //check clothes in chosenClothes and highlight them
    console.log(chosenClothes);
    chosenClothes.forEach((id) => {
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'lightgreen';
        //find id select-option and change value to select
        const selectOption = document.getElementById('choose-option');
        console.log(selectOption);
        if (selectOption) {
          selectOption.value = 'select';
        }
        console.log(selectOption);
      }
    });
  }, [sizeFilter, colorFilter, typeFilter, kindFilter]);



  useEffect(() => {
    chosenClothes.forEach((id) => {
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'lightgreen';
      }
    });
    setUpdateSelection(true)
  }, [clothes]);

  useEffect(() => {
    setUpdateSelection(false);
  }, [updateSelection]);

  const handleSelectOption = (id) => {
    const clothRow = document.querySelector(`tr[row="row-${id}"]`);
    if (clothRow) {
      //if its background color is green, return select
      if (clothRow.style.backgroundColor === 'lightgreen') {
        return 'select';
      }
    }
    return '';
  }

  const resetFilters = () => {
    setSizeFilter('');
    setcolorFilter('');
    setTypeFilter('');
    setKindFilter('');
    //input to default value
    document.getElementById('sizeFilter').value = '';
    document.getElementById('colorFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('kindFilter').value = '';

    //check clothes in chosenClothes and highlight them
    console.log(chosenClothes);
    chosenClothes.forEach((id) => {
      const clothRow = document.querySelector(`tr[row="row-${id}"]`);
      if (clothRow) {
        clothRow.style.backgroundColor = 'lightgreen';
      }
    });
  };


  const PrintModalContent = () => {
    const TotalRentFee = chosenClothes.reduce((acc, id) => {
      const clothObj = clothes.find((c) => c.id === id);
      return acc + clothObj.RentalFee;
    }, 0);
    const TotalDepositFee = chosenClothes.reduce((acc, id) => {
      const clothObj = clothes.find((c) => c.id === id);
      return acc + clothObj.Deposit;
    }, 0);
    const TotalPrice = TotalRentFee + TotalDepositFee;
    setTotalPrice(TotalPrice);
    setTotalDepositFee(TotalDepositFee);
    setTotalRentFee(TotalRentFee);
    return (
      <div>
        <img src="rent-clothes/b2.png" alt="Kalynn.store" style={{ width: '25%', float: 'right' }} />
        <div className='print-customer-info' style={{ display: 'none' }}>
          <p><strong>Khách hàng:</strong> {customerName} <strong>Điện thoại:</strong> {customerNumber} <strong>Địa chỉ:</strong> {customerAddress}</p>
        </div>
        <table style={{ fontSize: '14px' }}>
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
            {chosenClothes.map((id, index) => {
              const clothObj = clothes.find((c) => c.id === id);
              return (
                <tr key={id}>
                  <td>{index + 1}</td>
                  <td>{clothObj.Color}</td>
                  <td>{clothObj.Type}</td>
                  <td>{clothObj.Size}</td>
                  <td>{clothObj.RentalFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
                  <td>{clothObj?.Deposit.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '16px', marginRight: '20px', textAlign: 'right' }}><strong>Tiền đặt cọc:</strong> {TotalDepositFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</p>
        <p style={{ fontSize: '16px', marginRight: '20px', textAlign: 'right' }}><strong>Tiền thuê:</strong> {TotalRentFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</p>
        <p style={{ borderTop: '1px solid black', paddingTop: '5px', fontSize: '18px', marginRight: '20px', textAlign: 'right' }}><strong>Tổng số tiền:</strong>  {TotalPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</p>
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
                <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}>{deliveryDate}</td>
                <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}>{returnDate}</td>
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
    for (const id of chosenClothes) {
      const clothesId = id;
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
    const clothesRented = chosenClothes.map((id) => {
      // const clothObj = clothes.find((c) => c.id === cloth.id);
      //update cloth in clothes collection to not available
      const clothRef = doc(firestore, 'clothes', id);
      updateDoc(clothRef, {
        Available: false
      });
      // const clothe = clothes.find((c) => c.id === id);
      // console.log(clothe);
      // const { RentalFee, DepositFee } = clothe;
      const cloth = clothes.find((c) => c.id === id);
      console.log(cloth);

      return { id: id, Returned: false, RentalFee: cloth.RentalFee, DepositFee: cloth.Deposit };
    });
    const timeStamps = new Date();
    const newBill = {
      Name: customerName,
      Number: customerNumber,
      Address: customerAddress,
      DeliveryDate: deliveryDate,
      ReturnDate: returnDate,
      TotalPrice: totalPrice,
      TotalDepositFee: totalDepositFee,
      TotalRentFee: totalRentFee,
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
    // findAllClothes();
  }, []);

  return (
    <div>
      <h2>Đặt hàng</h2>
      <button style={{ padding: '10px 20px', marginRight: '10px', fontSize: '16px', backgroundColor: 'lightblue', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={handleOrder}>Đặt các hàng đã chọn {countChosenClothes}</button>
      <button style={{ padding: '10px 20px', marginRight: '10px', fontSize: '16px', backgroundColor: 'lightyellow', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={resetAllChosen}>Bỏ chọn tất cả</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Loại</th>
            <th>Thương hiệu</th>
            <th>Màu sắc</th>
            <th>Hình dạng</th>
            <th>Giá thuê</th>
            <th>Tiền đặt cọc</th>
            <th>Size</th>
            {/* <th>Gender</th> */}
            <th>Action</th>
          </tr>
          <tr>
            <td colSpan="6" style={{ backgroundColor: '#f2f2f2', padding: '5px' }}>
              <button style={{ backgroundColor: 'lightyellow' }} onClick={resetFilters}>Hiện tất cả</button>
              <strong>Filter:</strong>&nbsp;
              {/* Gender:
              <select onChange={(e) => handleFilter('genderFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Unisex">Unisex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              &nbsp; */}
              Loại:
              <select id='kindFilter' name="Kind" onChange={(e) => handleFilter('kindFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Quần áo">Quần áo</option>
                <option value='Phụ kiện'>Phụ kiện</option>
                <option value='Khác'>Khác</option>
              </select>

              Size:
              <select id='sizeFilter' onChange={(e) => handleFilter('sizeFilter', e.target.value)}>
                <option value="">All</option>
                <option value="S">S</option>
                <option value="XS">XS</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              Màu sắc:
              <select id='colorFilter' name="Color" onChange={(e) => handleFilter('colorFilter', e.target.value)}>
                <option value="">All</option>
                <option value="Khác">Khác</option>
                <option value="Đỏ">Đỏ</option>
                <option value="Trằng">Trắng</option>
                <option value="Kem">Kem</option>
                <option value="Đen">Đen</option>
                <option value="Hồng">Hồng</option>
                <option value="Váy Hoa">Váy Hoa</option>
                <option value="Vàng">Vàng</option>
              </select>
              Dạng:
              <input id="typeFilter" type="text" name="Type" onChange={(e) => handleFilter('typeFilter', e.target.value)} />
            </td>
          </tr>
        </thead>
        <tbody>
          {clothes.map((cloth) => (
            <tr row={`row-${cloth.id}`} key={cloth.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><img src={cloth.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /></td>
              <th>{cloth.Kind}</th>
              <td>{cloth.Brand}</td>
              <td>{cloth.Color}</td>
              <td>{cloth.Type}</td>
              <td>{cloth.RentalFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
              <td>{cloth.Deposit.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
              <td>{cloth.Size.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              {/* <td>{cloth.Gender}</td> */}
              <td>
                {
                  cloth.Available ?
                    <select value={handleSelectOption(cloth.id)} id='choose-option' onChange={(e) => handleChooseOption(cloth.id, e.target.value)}>
                      <option value="select">Chọn</option>
                      <option value="">Lựa chọn</option>
                    </select> : <button disabled>Không còn hàng</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <PrintModalContent />
        <label style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
          Họ tên:
          <input style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px', border: '1px solid lightgrey' }} type="text" name="Name" onChange={handleChangeName} />
        </label>
        <label style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
          Số điện thoại:
          <input style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px', border: '1px solid lightgrey' }} type="number" name="Number" onChange={handleChangeNumber} />
        </label>
        <label style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
          Địa chỉ:
          <textarea style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px', border: '1px solid lightgrey' }} type="text" name="Address" onChange={handleChangeAddress} />
        </label>
        <label style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
          Ngày giao:
          <textarea style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px', border: '1px solid lightgrey' }} type="text" name="Address" onChange={handleChangeDateSend} />
        </label>
        <label style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
          Ngày trả:
          <textarea style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px', border: '1px solid lightgrey' }} type="text" name="Address" onChange={handleChangeDateReturn} />
        </label>

        <div style={{ margin: '5px' }}>
          <button style={{ backgroundColor: 'lightblue', marginRight: '10px', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none' }} onClick={handlePlaceOrder} disabled={isOrderPlaced}>Đặt Hàng</button>
          <button style={{ marginRight: '10px', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none' }} onClick={handlePrintBill} disabled={!isBillPrintable}>In Bill</button>
          <button style={{ backgroundColor: 'lightyellow', marginRight: '10px', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none' }} onClick={closeModal}>Close</button>
          <button style={{ backgroundColor: '#FF3333', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none' }} onClick={handleDeleteOrder} disabled={!isOrderPlaced}>Xóa đơn hàng</button>
        </div>
      </Modal>

    </div>
  );
};

export default Order;
