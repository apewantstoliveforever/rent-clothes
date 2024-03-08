import React, { useState, useEffect } from 'react';
import { getDoc, updateDoc, doc, orderBy } from "firebase/firestore";
import { firestore } from '../service/firebase';
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { format } from 'date-fns';
import ReactDOMServer from 'react-dom/server';


const PrintModalContent = ({ bill }) => {
    console.log('Bill:', bill);
    const { id, Name, Number, Address, clothesRented, TotalDepositFee, TotalRentFee, TotalPrice, DeliveryDate, ReturnDate } = bill;
    return (
        <div>
            <img src="rent-clothes/b2.png" alt="Kalynn.store" style={{ width: '25%', float: 'right' }} />
            <div className='print-customer-info' style={{ display: 'none' }}>
                <p><strong>Khách hàng:</strong> {Name} <strong>Điện thoại:</strong> {Number} <strong>Địa chỉ:</strong> {Address}</p>
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
                    {clothesRented?.map((clothObj, index) => {
                        return (
                            <tr key={id}>
                                <td>{index + 1}</td>
                                <td>{clothObj.Color}</td>
                                <td>{clothObj.Type}</td>
                                <td>{clothObj.Size}</td>
                                <td>{clothObj?.RentalFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
                                <td>{clothObj?.DepositFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} đồng</td>
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
                            <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}>{DeliveryDate}</td>
                            <td style={{ border: '1px solid black', padding: '5px', height: '30px' }}>{ReturnDate}</td>
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

const Cloth = ({ cloth }) => {
    const [clothData, setClothData] = useState(null);
    useEffect(() => {
        // Fetch cloth data by ID
        const clothRef = doc(firestore, 'clothes', cloth.id);
        const getCloth = async () => {
            try {
                const clothSnap = await getDoc(clothRef);
                const clothData = clothSnap.data();
                console.log('Cloth data:', clothData);
                setClothData(clothData);
            } catch (error) {
                console.error('Error fetching cloth data:', error.message);
            }
        };
        getCloth();
    }, [cloth]);

    return (
        <div>
            {clothData && (
                <div>
                    <img src={clothData.imageUrl} alt={cloth.Type} style={{ width: '100px' }} />
                    <span style={{ marginLeft: '10px' }}>{clothData.Color}</span>
                    <span style={{ marginLeft: '10px' }}>{clothData.Type}</span>
                    <span style={{ marginLeft: '10px' }}>{clothData.Deposit}</span>
                </div>
            )}
        </div>
    );
};

const Bill = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(firestore, 'bills'), where('Returned', '==', false)), (snapshot) => {
            const billsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBills(billsData);
            setFilteredBills(billsData);
        });
        return () => unsubscribe();
    }, []);

    const returnCloth = async (billId, cloth) => {
        const billRef = doc(firestore, 'bills', billId);
        try {
            const billSnap = await getDoc(billRef);
            const billData = billSnap.data();
            cloth.Returned = true;
            const clothRef = doc(firestore, 'clothes', cloth.id);
            await updateDoc(clothRef, { Available: true });

            // Update clothesRented array in bill
            const updatedClothesRented = billData.clothesRented.map(c => (c.id === cloth.id ? cloth : c));
            await updateDoc(billRef, {
                clothesRented: updatedClothesRented,
                Returned: updatedClothesRented.every(c => c.Returned)
            });

            console.log(updatedClothesRented.every(c => c.Returned) ? 'Bill returned' : 'Cloth returned');
        } catch (error) {
            console.error('Error returning cloth or updating bill: ', error.message);
        }
    };

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filteredBills = bills.filter(bill =>
            bill.Name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchValue) ||
            bill.Number.toLowerCase().includes(searchValue)
        );
        setFilteredBills(filteredBills);
        console.log(filteredBills);
    };

    const resetSearchInput = () => {
        // Reset search input fields
        document.getElementById('searchByName').value = '';
        document.getElementById('searchByPhoneNumber').value = '';
        // Reset filtered bills to show all bills
        setFilteredBills(bills);
    };

    const formatTimeStamp = (timestamp) => {
        const formattedDate = format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
        return formattedDate;
    }

    const handlePrintBill = (bill) => {
        const printContent = ReactDOMServer.renderToStaticMarkup(<PrintModalContent bill={bill} />); // Render as JSX component
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
        // closeModal();
        console.log('Print Bill');
      };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Trả hàng</h2>
            {/* search name */}
            <input id="searchByName" onChange={handleSearch} type="text" placeholder="Tìm theo tên" />
            <input id="searchByPhoneNumber" onChange={handleSearch} type="text" placeholder="Tìm theo số điện thoại" />
            {/* Reset search button */}
            <button style={{ backgroundColor: 'lightyellow' }} onClick={resetSearchInput}>Hiện tất cả</button>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>print</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Bill ID</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Ngày nhập</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Ngày giao</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Ngày trả</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Khác hàng</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Số điện thoại</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Địa chỉ</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Tiền đã cọc</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Tổng số tiền</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBills.map((bill, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ border: '1px solid black', padding: '10px' }}>
                                <button
                                    style={{ padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    onClick={() => handlePrintBill(bill)}
                                >
                                    In
                                </button>
                            </td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.id}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{formatTimeStamp(bill.Date)}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.DeliveryDate}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.ReturnDate}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Name}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Number}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Address}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.TotalDepositFee}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.TotalPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>
                                {bill.clothesRented.map((cloth, index) => (
                                    <div key={index} style={{ border: '1px solid black', marginBottom: '5px' }}>
                                        {/* <span>{cloth.id}</span> */}
                                        <Cloth cloth={cloth} />
                                        {!cloth.Returned ? (
                                            <button
                                                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                                onClick={() => returnCloth(bill.id, cloth)}
                                            >
                                                Trả
                                            </button>
                                        ) : (
                                            <span style={{ marginLeft: '10px', color: 'green' }}>Trả hàng</span>
                                        )}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Bill;
