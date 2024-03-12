import React, { useState } from 'react';

const Item = ({ onImageChange, onInputChange, item }) => {
    return (
        <form style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <label style={{ margin: '5px' }}>
                Hình ảnh:
                <input type="file" name="Image" onChange={onImageChange} />
            </label>
            <label style={{ margin: '5px' }}>
                {/* Display image preview */}
                {item.image && <img src={URL.createObjectURL(item.image)} alt="image" style={{ maxWidth: '80px', maxHeight: '80px' }} />}
            </label>
            <label style={{ margin: '5px' }}>
                Loại:
                <select name="Kind" value={item.Kind} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value="Quần áo">Quần áo</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="">Khác</option>
                </select>
            </label>
            <label style={{ margin: '5px' }}>
                Thương hiệu:
                <input type="text" name="Brand" value={item.Brand} onChange={onInputChange} />
            </label>
            <label style={{ margin: '5px' }}>
                Màu sắc:
                <select name="Color" value={item.Color} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value="Đỏ">Đỏ</option>
                    <option value="Trằng">Trắng</option>
                    <option value="Kem">Kem</option>
                    <option value="Đen">Đen</option>
                    <option value="Hồng">Hồng</option>
                    <option value="Váy Hoa">Váy Hoa</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Khác">Khác</option>
                </select>
            </label>
            <label style={{ margin: '5px' }}>
                Hình dạng:
                <input type="text" name="Type" value={item.Type} onChange={onInputChange} />
            </label>
            <label style={{ margin: '5px' }}>
                Size:
                <select name="Size" value={item.Size} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                </select>
            </label>
            <label style={{ margin: '5px' }}>
                Tiền cọc:
                <input type="number" name="Deposit" value={item.Deposit} onChange={onInputChange} min="0" />
            </label>
            {/* <label style={{ margin: '5px' }}>
                Gender
                <select name='Gender' value={item.Gender} onChange={onInputChange} style={{ padding: '5px' }}>
                    <option value='Unisex'>Unisex</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                </select>
            </label> */}
            <label style={{ margin: '5px' }}>
                Tiền thuê:
                <input type="number" name="RentalFee" value={item.RentalFee} onChange={onInputChange} min="0" />
            </label>
        </form>
    );
};

const AddClothesForm = ({ addNewClothes }) => {
    const [items, setItems] = useState([{ Kind:'', Brand: '', Color: 'Khác', Deposit: 0, Type: '', Size: 'XS', RentalFee: 0, Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const maxWidth = 800; // Set your maximum width here
                const maxHeight = 600; // Set your maximum height here
                let width = img.width;
                let height = img.height;

                // Calculate new width and height while maintaining aspect ratio
                if (width > height && width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    const newItems = [...items];
                    newItems[index].image = resizedFile;
                    setItems(newItems);
                }, 'image/jpeg', 0.2); // Adjust quality as needed (0.1 - 1)
            };
        };
        reader.readAsDataURL(file);
    };


    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const newItems = [...items];
        // newItems[index][name] = value;
        //if its number, convert to number
        if (name && name === 'RentalFee') {
            newItems[index][name] = Number(value);
        }
        else if (name && name === 'Deposit') {
            newItems[index][name] = Number(value);
        }
        else {
            newItems[index][name] = value;
        }
        setItems(newItems);
        // console.log(items);
    };

    const handleAddMore = () => {
        setItems([...items, { Kind:'', Brand: '', Color: 'Khác', Deposit: 0, Type: '', Size: 'XS', RentalFee: 0, Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addNewClothes(items);
        // Reset items array
        setItems([{ Kind:'', Brand: '', Deposit: 0, Color: 'Khác', Type: '', Size: 'XS', RentalFee: 0, Available: true, Image: '', Gender: 'Unisex', InBillId: null, image: null }]);
    };

    return (
        <div>
            {items.map((item, index) => (
                <div key={index} style={{ textAlign: 'center', margin: '20px', border: '1px solid black', padding: '5px' }}>
                    <Item
                        item={item}
                        onImageChange={(e) => handleImageChange(index, e)}
                        onInputChange={(e) => handleInputChange(index, e)}
                    />
                    <button style={{backgroundColor: 'lightyellow'}} onClick={() => setItems(items.filter((_, i) => i !== index))}>Xóa</button>
                </div>
            ))}
            <button onClick={handleAddMore}>Thêm</button>
            <button type="submit" style={{ backgroundColor:'lightgreen', padding: '10px', marginTop: '10px' }} onClick={handleSubmit}> Xác nhận thêm quần áo</button>
        </div>
    );
};

export default AddClothesForm;
