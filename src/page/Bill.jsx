import React, { useState, useEffect } from 'react';
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { firestore } from '../service/firebase';
import { onSnapshot, query, collection, where } from "firebase/firestore";

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



    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Bills</h1>
            {/* search name */}
            <input id="searchByName" onChange={handleSearch} type="text" placeholder="Search by name" />
            <input id="searchByPhoneNumber" onChange={handleSearch} type="text" placeholder="Search by phone number" />
            {/* Reset search button */}
            <button onClick={resetSearchInput}>Hiện tất cả</button>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Bill ID</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Customer Name</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Phone Number</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Address</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Total Amount</th>
                        <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBills.map((bill, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.id}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Name}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Number}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{bill.Address}</td>
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
                                                Return
                                            </button>
                                        ) : (
                                            <span style={{ marginLeft: '10px', color: 'green' }}>Returned</span>
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
