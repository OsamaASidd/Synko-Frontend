import { order_item_status } from "./constants";

export const calculateTotalCostOfOrder = (orders, cb, merchant = null) => {
  if (Array.isArray(orders) && orders.length > 0) {
    // Calculate the total cost by summing the (quantity * price) for all items in the orders
    const total = orders.reduce((acc, item) => {
      if (
        item?.status == order_item_status.canceled ||
        item?.status == order_item_status.wasted
      ) {
        return acc;
      }
      const itemCost = item?.MenuItemPrice?.price ?? 0;
      const itemQuantity = item.quantity || 1; // Default to 1 if quantity is not defined
      return acc + itemCost * itemQuantity;
    }, 0);

    const merchant_tax = orders?.tax?.tax ?? 0;

    // Calculate the tax (15% of the total cost)
    let totalWithTax = 0;
    let tax = 0;
    if (merchant_tax > 0) {
      const taxRate = merchant_tax / 100; // 15% tax rate
      tax = total * taxRate;
      totalWithTax = total + tax;
    } else {
      totalWithTax = total;
      tax = 0;
    }

    return cb(tax.toFixed(2), total.toFixed(2), totalWithTax.toFixed(2));
  }
  return cb(0, 0, 0);
};
