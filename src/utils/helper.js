import moment from "moment";
import Swal from "sweetalert2";

export function calcAmount(discount, tax, amount) {
  let discountedCost = parseFloat(amount); // Ensure discountedCost is a number
  let discountAmount = 0;
  if (discount && discount.discount_type === "by_payment") {
    discountedCost = Math.max(0, discountedCost - (discount.discount || 0));
    discountAmount = discount.discount || 0;
  } else if (discount && discount.discount_type === "by_percentage") {
    const discountPercentage =
      (discountedCost * (discount.discount || 0)) / 100;
    discountedCost = Math.max(0, discountedCost - discountPercentage);
    discountAmount = discountPercentage;
  }
  return { discountedCost, discountAmount };
}

export const getTotalProductCost = (data, withDiscount = false) => {
  let totalPrice = +data?.MenuItemPrice?.price || 0;
  totalPrice = totalPrice * data?.quantity;
  const totalModificationsCost =
    data?.modifications?.reduce((total, modification) => {
      const modification_option_price =
        +modification?.ModificationOptionPrice?.extra_cost ?? 0;
      return total + modification_option_price;
    }, 0) || 0;
  const { discountAmount, discountedCost } = calcAmount(
    data?.discount,
    null,
    totalPrice
  );
  if (withDiscount == false) {
    return discountedCost + totalModificationsCost;
  } else {
    return discountAmount;
  }
};

export const showSuccessMessage = (message) => {
  Swal.fire({
    text: message,
    icon: "success",
  });
};

export const showErrorMessage = (message) => {
  Swal.fire({
    text: message,
    icon: "error",
  });
};

export function calculateTotalCost(cartItems, isIgnore = false) {
  const totalCost = cartItems.reduce((total, item) => {
    if (item?.removeItems) {
      return total;
    }
    if (isIgnore == true) {
      if (
        item?.status == order_item_status.canceled ||
        item?.status == order_item_status.wasted
      ) {
        return total;
      }
    }
    const itemPrice = +item?.MenuItemPrice?.price || 0;
    if (item?.discount) {
      const { discountedCost } = calcAmount(item?.discount, null, itemPrice);
      return total + discountedCost * item.quantity;
    } else {
      return total + itemPrice * item.quantity;
    }
  }, 0);

  const totalModificationsCost = cartItems.reduce((totalCost, item) => {
    const itemModificationsCost = item?.modifications?.reduce(
      (total, modification) => {
        return (
          total + Number(modification.ModificationOptionPrice.extra_cost || 0)
        );
      },
      0
    );
    return totalCost + itemModificationsCost;
  }, 0);

  return totalCost + totalModificationsCost;
}

export function calculateTotalCostBySplitItems(cartItems, isIgnore = false) {
  const totalCost = cartItems.reduce((total, itemS) => {
    const item = itemS.order_item;
    if (item?.removeItems) {
      return total;
    }
    if (isIgnore == true) {
      if (
        item?.status == order_item_status.canceled ||
        item?.status == order_item_status.wasted
      ) {
        return total;
      }
    }
    const itemPrice = +item?.MenuItemPrice?.price || 0;
    return total + itemPrice * itemS.quantity;
  }, 0);

  const totalModificationsCost = cartItems.reduce((totalCost, itemS) => {
    const item = itemS.order_item;
    const itemModificationsCost = item?.modifications?.reduce(
      (total, modification) => {
        return (
          total + Number(modification.ModificationOptionPrice.extra_cost || 0)
        );
      },
      0
    );
    return totalCost + itemModificationsCost;
  }, 0);

  return totalCost + totalModificationsCost;
}

export function calculatePriceWithTax(
  merchant,
  totalCost,
  discount_value = 0,
  otherData = null,
  serviceCharges,
  deliveryCharges
) {
  let service_charges = +serviceCharges || 0;
  let delivery_charges = +deliveryCharges || 0;

  let merchant_tax = 0;
  if (otherData !== null && otherData?.checkout == true) {
    if (merchant?.is_tax_separate == true) {
      if (otherData?.paymentMethod == "cash") {
        merchant_tax = +merchant?.cash_tax?.tax || 0;
      } else {
        merchant_tax = +merchant?.card_tax?.tax || 0;
      }
    } else {
      merchant_tax = +merchant?.tax?.tax || 0;
    }
  } else {
    merchant_tax = +merchant?.tax?.tax || 0;
  }

  let taxRate = 0;
  let tax = 0;
  if (merchant_tax > 0) {
    taxRate = merchant_tax / 100; // 15% tax rate
    if (discount_value > 0) {
      tax =
        (totalCost - discount_value + service_charges + delivery_charges) *
        taxRate;
    } else if (discount_value == 0) {
      tax = (totalCost + service_charges + delivery_charges) * taxRate;
    }
  }
  const totalWithTax = totalCost + tax;
  return { tax, totalWithTax, totalCost };
}

export function convertJson(key) {
  try {
    return JSON.parse(key);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

export function formatNumber(num) {
  let temp = +num;
  // temp && temp >= 0
  if (temp) {
    return temp?.toFixed(2);
  }
  return 0;
}

export const getErrorMessageFromResponse = (err) => {
  const defaultMessage = "An error occurred"; // A default message in case neither messages nor message is available
  const message = err?.response?.data?.messages
    ? Object.values(err.response.data.messages)[0][0]
    : err?.response?.data?.message || defaultMessage;

  Swal.fire({
    icon: "error",
    text: message,
  });
};

// custom pagination load more baksh
export const loadMore = (array, currentPageNumber, currentPageSize) => {
  // Calculate the start and end indices for the slice
  const startIndex = (currentPageNumber - 1) * currentPageSize;
  const endIndex = currentPageNumber * currentPageSize;

  // Slice the array for the current page
  const currentPageItems = array.slice(startIndex, endIndex);

  // Increment the page number for the next load
  currentPageNumber++;

  // Calculate total pages
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);

  // Determine if there are more items to load
  const hasMore = currentPageNumber <= totalPages;

  // Return the items for the current page along with pagination information
  return {
    items: currentPageItems,
    currentPage: currentPageNumber - 1, // Adjusting to 0-based index
    totalPages: totalPages,
    hasMore: hasMore,
  };
};

export const calculatePaymentMethodIfSplit = (orders) => {
  let result = {
    cash: 0,
    card: 0,
  };
  try {
    for (let order of orders) {
      if (order?.order_splits.length > 0) {
        let order_splits = order?.order_splits;

        if (order_splits[0].split_status == "by_product") {
          // let Price =
          let splited_item = {};
          order?.order_splits.forEach((order_split) => {
            // if order_split_id match with orderItems
            let order_item = order?.order_items.filter(
              (order_itemElm) =>
                order_itemElm.order_item_id ===
                order_split?.order_splits[0].order_item_id
            );
            if (order_item.length > 0) {
              let item_id = order_split?.order_splits[0].order_item_id;
              if (!splited_item[item_id]) {
                splited_item[item_id] = {
                  quantity: 0,
                  id: item_id,
                };
              }
              splited_item[item_id].quantity +=
                order_split?.order_splits[0].quantity;

              if (order_split.payment_method == "cash") {
                result.cash +=
                  parseFloat(order_item[0].MenuItemPrice.price) *
                  order_split?.order_splits[0].quantity;
              } else if (order_split.payment_method == "card") {
                result.card +=
                  parseFloat(order_item[0].MenuItemPrice.price) *
                  order_split?.order_splits[0].quantity;
              }
            }
          });
          let order_items = order?.order_items;
          order_items.forEach((order_item) => {
            let selectedObj = splited_item[`${order_item.order_item_id}`];

            if (selectedObj) {
              if (selectedObj.quantity < order_item.quantity) {
                let remain_quantity =
                  order_item.quantity - selectedObj.quantity;

                let price =
                  parseFloat(order_item.MenuItemPrice.price) * remain_quantity;
                if (order?.paid_by == 1) {
                  result.cash += price;
                } else if (order?.paid_by == 2) {
                  result.card += price;
                }
              }
            } else {
              let price =
                parseFloat(order_item.MenuItemPrice.price) *
                order_item?.quantity;
              if (order?.paid_by == 1) {
                result.cash += price;
              } else if (order?.paid_by == 2) {
                result.card += price;
              }
            }
          });
        } else {
          let split_amount = 0;
          let total_split_amount = 0;
          for (let i = 0; i < order.order_splits.length; i++) {
            split_amount = order.net_amount / order.order_splits[i].split_by;

            if (order.order_splits[i].payment_method == "cash") {
              result.cash += split_amount;
              total_split_amount += split_amount;
            } else {
              result.card += split_amount;
              total_split_amount += split_amount;
            }
          }
          if (order.gross_total != total_split_amount) {
            let remaining_amount = order.gross_total - total_split_amount;

            if (order.paid_by == 1) {
              result.cash += remaining_amount;
            } else {
              result.card += remaining_amount;
            }
          }
        }
      }
    }

    return result;
  } catch (err) {
    console.log("err is calculatePaymentMethodIfSplit func");
  }
};

export function extractDateTimeInfo(dateTimeStr) {
  // Parse the date string into a Date object
  var dateObj = new Date(dateTimeStr);
  // Extract individual components
  var hours = dateObj.getHours();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours > 12 ? hours - 12 : hours;
  hours = hours < 10 ? "0" + hours : hours;
  var minutes = dateObj.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var date = dateObj.getDate();
  date = date < 10 ? "0" + date : date;
  var month = dateObj.getMonth() + 1; // Adding 1 since getUTCMonth() returns zero-based month
  month = month < 10 ? "0" + month : month;
  var year = dateObj.getFullYear();
  var seconds = dateObj.getSeconds();
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return {
    hours: hours,
    minutes: minutes,
    date: date,
    month: month,
    year: year,
    seconds: seconds,
    ampm,
  };
}

export function getDateRange(period) {
  const now = new Date();
  let startDate, endDate;

  switch (period.toLowerCase()) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "yesterday":
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "this week":
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setDate(startDate.getDate() + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last week":
      startDate = new Date(now.setDate(now.getDate() - now.getDay() - 7));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setDate(startDate.getDate() + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    case "this month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "this year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last year":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      throw new Error("Invalid period specified");
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const formatToMySQLDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSpanningMoreThanOneMonth = (dateRange) => {
  const [startDate, endDate] = dateRange;
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth()
  );
};

export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const formatDatetime = (datetime) => {
  if (!datetime) return "";
  return moment.utc(datetime).format("YYYY-MM-DDTHH:mm"); // Format as desired
};

export const FILTERS = {
  sales_report: "sales_report",
  device_report: "device_report",
  payment_methods: "payment_methods",
  item_sales: "item_sales",
  category_sales: "category_sales",
  cash_drawer: "cash_drawer",
  employee_sales: "employee_sales",
  discount_applied: "discount_applied",
  rush_hours: "rush_hours",
};

export const ifPagePermission = (mySubscription, pageName) => {
  const subscription = mySubscription?.subscription;
  const subscriptionItems = subscription?.subscription_items;
  if (!pageName) {
    return true;
  }
  if (subscriptionItems?.some((val) => val?.name == pageName)) {
    return true;
  }
  return false;
};
