-- Fix shops with 0,0 coordinates (defaulting them to T. Nagar, Chennai)
UPDATE shops 
SET 
    latitude = 12.9716, 
    longitude = 80.2534,
    area = 'T. Nagar',
    city = 'Chennai',
    state = 'TN',
    pincode = '600017',
    full_address = 'T. Nagar, Chennai'
WHERE latitude = 0 OR longitude = 0;

-- Also update their items to have the new shop location? 
-- (Actually, items don't store location if we did it right, 
-- but wait, in BuyerMap we select shops(lat, long).
-- Inventory items don't have lat/long columns? 
-- Let's check schema. BuyerMap joins shops. So updating shops fixes all items!)
