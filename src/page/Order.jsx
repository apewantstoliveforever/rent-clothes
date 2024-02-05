import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';

import Modal from 'react-modal';

Modal.setAppElement('#root');

const Order = () => {
  const [clothes, setClothes] = useState([
    { id: 1, name: 'T-Shirt', price: 20, size: 'M', gender: 'Female' },
    { id: 2, name: 'Jeans', price: 40, size: 'L', gender: 'Male' },
    { id: 3, name: 'Sweater', price: 35, size: 'XL', gender: 'Male' },
    { id: 4, name: 'Dress', price: 50, size: 'S', gender: 'Female' },
    { id: 5, name: 'Hoodie', price: 45, size: 'M', gender: 'Unisex' },
    { id: 6, name: 'Skirt', price: 30, size: 'S', gender: 'Female' },
    { id: 7, name: 'Shorts', price: 25, size: 'M', gender: 'Male' },
    { id: 8, name: 'Jacket', price: 60, size: 'L', gender: 'Unisex' },
    { id: 9, name: 'Blouse', price: 35, size: 'S', gender: 'Female' },
    { id: 10, name: 'Chinos', price: 45, size: 'L', gender: 'Male' },
    { id: 11, name: 'Polo Shirt', price: 25, size: 'M', gender: 'Male' },
    { id: 12, name: 'Coat', price: 70, size: 'XL', gender: 'Unisex' },
    { id: 13, name: 'Sweatpants', price: 30, size: 'L', gender: 'Male' },
    { id: 14, name: 'Tank Top', price: 15, size: 'S', gender: 'Female' },
    { id: 15, name: 'Cardigan', price: 40, size: 'M', gender: 'Unisex' },
    { id: 16, name: 'Cargo Pants', price: 50, size: 'L', gender: 'Male' },
    { id: 17, name: 'Maxi Dress', price: 55, size: 'S', gender: 'Female' },
    { id: 18, name: 'Beanie', price: 10, size: 'One Size', gender: 'Unisex' },
    { id: 19, name: 'Flannel Shirt', price: 35, size: 'M', gender: 'Male' },
    { id: 20, name: 'Socks', price: 5, size: 'One Size', gender: 'Unisex' },
  ]);

  const [chosenClothes, setChosenClothes] = useState([]);

  const [countChoosenClothes, setCountChoosenClothes] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);


  const handleChooseOption = (id, option) => {
    //if id not in chosenClothes, add it
    //else replace the option
    const cloth = chosenClothes.find((c) => c.id === id);
    if (!cloth) {
      setChosenClothes([...chosenClothes, { id, option }]);
    } else {
      // if option value is empty, remove the cloth from chosenClothes
      if (!option) {
        setChosenClothes(chosenClothes.filter((c) => c.id !== id));
      } else {
        setChosenClothes(chosenClothes.map((c) => (c.id === id ? { ...c, option } : c)));
      }
    }
  };

  const handleOrder = () => {
    console.log('Ordering clothes...');
    console.log(chosenClothes);

    // Calculate total price
    let totalPrice = 0;
    chosenClothes.forEach((cloth) => {
      const clothObj = clothes.find((c) => c.id === cloth.id);
      totalPrice += clothObj.price;
    });
    setTotalPrice(totalPrice);
    console.log('Total Price:', totalPrice);
    setIsModalOpen(true);

  };

  const closeModal = () => {
    // Close the modal
    setIsModalOpen(false);
  };

  const PrintModalContent = () => {
    return (
      <div>
        <h2>Order Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Option</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {chosenClothes.map((cloth) => {
              const clothObj = clothes.find((c) => c.id === cloth.id);
              return (
                <tr key={cloth.id}>
                  <td>{clothObj.name}</td>
                  <td>{cloth.option}</td>
                  <td>${clothObj.price}</td>
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
    const printContent = ReactDOMServer.renderToStaticMarkup(PrintModalContent());
    const printWindow = window
    printWindow.document.write('<html><head><title>Print</title></head><body>');
    printWindow.document.write('<div>');
    printWindow.document.write('<style>table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid black; padding: 8px;}</style>');
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



  useEffect(() => {
    setCountChoosenClothes(chosenClothes.length);
  }, [chosenClothes]);

  return (
    <div>
      <h1>Order</h1>
      <ul>
        {clothes.map((cloth) => (
          <li key={cloth.id}>
            <strong>{cloth.name}</strong> - ${cloth.price} - Size: {cloth.size} - Gender: {cloth.gender}{' '}
            <select onChange={(e) => handleChooseOption(cloth.id, e.target.value)}>
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </li>
        ))}
      </ul>
      <button onClick={handleOrder}>Place Order {countChoosenClothes}</button>
      {/* Modal */}
      {/* Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        {PrintModalContent()}
        <p>Total Price: ${totalPrice}</p>
        <button>Confirm</button>
        <button onClick={handlePrintBill}>Print Bill</button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Order;
