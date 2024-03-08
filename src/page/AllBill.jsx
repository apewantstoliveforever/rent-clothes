import React, { useState, useEffect } from 'react';
import { getDoc, updateDoc, doc, startAfter } from "firebase/firestore";
import { firestore } from '../service/firebase';
import { startAt, orderBy, onSnapshot, query, collection, where, getCountFromServer, limit } from "firebase/firestore";
import { format } from 'date-fns';

const Cloth = ({ cloth }) => {
    const [clothData, setClothData] = useState(null);
    useEffect(() => {
        // Fetch cloth data by ID
        const clothRef = doc(firestore, 'clothes', cloth.id);
        const getCloth = async () => {
            try {
                const clothSnap = await getDoc(clothRef);
                const clothData = clothSnap.data();
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
                    {/* <img src={clothData.imageUrl} alt={cloth.Type} style={{ width: '100px' }} /> */}
                    <span style={{ marginLeft: '10px' }}>{clothData.Color}</span>
                    <span style={{ marginLeft: '10px' }}>{clothData.Type}</span>
                    <span style={{ marginLeft: '10px' }}>{clothData.Deposit}</span>
                </div>
            )}
        </div>
    );
};

const AllBill = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [mounted, setMounted] = useState(false);


    const handlePageDecrease = () => {
        if (currentPage === 1) return;
        setCurrentPage(currentPage - 1);
    }

    const handlePageIncrease = () => {
        if (currentPage === pageCount) return;
        setCurrentPage(currentPage + 1);
    }

    useEffect(() => {
        const numberOfBills = async () => {
            const billRef = collection(firestore, 'bills');
            const billSnap = await getCountFromServer(billRef);
            const count = Number(billSnap._data.count.integerValue);
            setPageCount(Math.ceil(count / 10));
        }
        numberOfBills();

        let q = collection(firestore, "bills");
        // Get the last visible document
        q = query(q, orderBy("Date", "desc"), limit(100));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const billsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBills(billsData);
            setFilteredBills(billsData);
        });

        setMounted(true);
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

            const updatedClothesRented = billData.clothesRented.map(c => (c.id === cloth.id ? cloth : c));
            await updateDoc(billRef, {
                clothesRented: updatedClothesRented,
                Returned: updatedClothesRented.every(c => c.Returned)
            });

            // console.log(updatedClothesRented.every(c => c.Returned) ? 'Bill returned' : 'Cloth returned');
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
    };

    const resetSearchInput = () => {
        document.getElementById('searchByName').value = '';
        document.getElementById('searchByPhoneNumber').value = '';
        setFilteredBills(bills);
    };

    const formatTimeStamp = (timestamp) => {
        const formattedDate = format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
        return formattedDate;
    }

    // useEffect(() => {
    // console.log('currentPage3', currentPage);
    //     if (mounted) {
    //         console.log('currentPage', currentPage);
    //         let q = collection(firestore, "bills");
    //         q = query(q, orderBy("Date", "desc"), limit(100) );
    //         const unsubscribe = onSnapshot(q, (snapshot) => {
    //         console.log('snapshot', snapshot);
    //             const billsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    //             console.log('billsData', billsData);
    //             setBills(billsData);
    //             setFilteredBills(billsData);
    //         });
    //         return () => unsubscribe();
    //     }
    // }, [currentPage]);

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Thêm hóa đơn</h2>
            <input id="searchByName" onChange={handleSearch} type="text" placeholder="Tìm kiếm theo tên" />
            <input id="searchByPhoneNumber" onChange={handleSearch} type="text" placeholder="Tìm kiếm số điện thoại" />
            <button onClick={resetSearchInput}>Hiện tất cả</button>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Bill ID</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Ngày nhập</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Khách hàng</th>
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
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.id}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{formatTimeStamp(bill.Date)}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Name}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Number}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Address}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.TotalDepositFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.TotalPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>
                                {bill.clothesRented.map((cloth, index) => (
                                    <div key={index} style={{ border: '1px solid black', marginBottom: '5px' }}>
                                        <Cloth cloth={cloth} />
                                        {!cloth.Returned ? (
                                            <button
                                                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                                onClick={() => returnCloth(bill.id, cloth)}
                                            >
                                                Trả
                                            </button>
                                        ) : (
                                            <span style={{ marginLeft: '10px', color: 'green' }}>Đã trả</span>
                                        )}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handlePageDecrease}>Trang trước</button>
            <span>{currentPage}</span>
            <button onClick={handlePageIncrease}>Trang sau</button>
        </div>
    );
};

export default AllBill;
