//Bill page

import React, { useState, useEffect } from 'react';

import { getDatabase, ref, onValue, set } from "firebase/database";
import { firestore } from '../service/firebase';
import { onSnapshot, collection, getDocs, updateDoc, doc, addDoc, query, where, getDoc } from "firebase/firestore";



const Bill = () => {
    const [bills, setBills] = useState([]);

    // const getData = async () => {
    //     try {
    //         const BillRef = collection(firestore, 'bills');
    //         // const BillSnapShot = await getDocs(BillRef);
    //         // const BillList = BillSnapShot.docs.map(doc => {
    //         //     return { id: doc.id, ...doc.data() };
    //         // });
    //         const q = query(collection(firestore, "bills"), where("Returned", "==", false));
    //         const querySnapshot = await getDocs(q);
    //         const BillList = querySnapshot.docs.map(doc => {
    //             return { id: doc.id, ...doc.data() };
    //         });
    //         return BillList;
    //     } catch (error) {
    //         console.error("Error getting documents: ", error);
    //     }
    // }

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(firestore, 'bills'), where('Returned', '==', false)), (snapshot) => {
            const billsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBills(billsData);
        });

        // Clean up function to unsubscribe from the snapshot listener when component unmounts
        return () => unsubscribe();
    }, []);


    const returnCloth = async (billId, cloth) => {
        const billRef = doc(firestore, 'bills', billId);
        try {
            const billSnap = await getDoc(billRef);
            const billData = billSnap.data();
            let updatedClothesRented = [];

            // Mark cloth as returned
            cloth.Returned = true;

            // Update cloth's availability in Firestore
            const clothRef = doc(firestore, 'clothes', cloth.id);
            await updateDoc(clothRef, {
                Available: true
            });

            // Update clothesRented array in bill
            const clothesRented = billData.clothesRented.map(c => {
                if (c.id === cloth.id) {
                    return cloth;
                }
                return c;
            });

            // Check if all clothes are returned
            const allReturned = clothesRented.every(c => c.Returned);

            // Update the bill's clothesRented and Returned fields if needed
            if (allReturned) {
                updatedClothesRented = clothesRented;
                await updateDoc(billRef, {
                    clothesRented: updatedClothesRented,
                    Returned: true
                });
                console.log('Bill returned');
            } else {
                updatedClothesRented = clothesRented;
                await updateDoc(billRef, {
                    clothesRented: updatedClothesRented
                });
                console.log('Cloth returned');
            }
        } catch (error) {
            console.error('Error returning cloth or updating bill: ', error.message);
        }
    };


    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Bills</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Bill ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Customer ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{bill.Address}</td>
                            <td style={{ padding: '10px' }}>{bill.Name}</td>
                            <td style={{ padding: '10px' }}>{bill.TotalPrice}</td>
                            <td style={{ padding: '10px' }}>
                                <div>
                                    {bill.clothesRented.map((cloth, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                            <p style={{ marginRight: '10px' }}>{cloth.id}</p>
                                            {cloth.Returned ? (
                                                <p style={{ color: 'green' }}>Returned</p>
                                            ) : (
                                                <button style={{ padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => returnCloth(bill.id, cloth)}>Return</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Bill;