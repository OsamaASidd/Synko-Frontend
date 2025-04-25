import { adminURL } from "./api";
export const TOKEN = "synko_token";
export const USERTOKEN = "synko_user_token";
export const MERCHANT = "synko_merchant_token";

export const paid_status = {
  paid: 1,
  unpaid: 2,
  refunded: 3,
  voided: 4,
};

export const paid_status_text = {
  1: "Paid",
  2: "Unpaid",
  3: "Refunded",
  4: "Voided",
};

export const paid_by = {
  none: 0,
  cash: 1,
  card: 2,
  credits: 3,
  foc: 4,
};

export const paid_by_text = {
  0: "None",
  1: "Cash",
  2: "Card",
  3: "Credits",
  4: "F.O.C",
};

export const order_status = {
  pending: 1,
  confirmed: 2,
  preparaing: 3,
  ready: 4,
  out_for_delivery: 5,
  delivered: 6,
  completed: 7,
  cancelled: 8,
  served: 9,
  refunded: 10,
};

export const order_status_text = {
  1: "Pending",
  2: "Confirmed",
  3: "Preparaing",
  4: "Ready",
  5: "Out For Delivery",
  6: "Delivered",
  7: "Completed",
  8: "Cancelled",
  9: "Voided",
};

export const order_type = {
  dine_in: 1,
  takeaway: 2,
  delivery: 3,
};
export const order_type_text = {
  1: "Dine In",
  2: "Takeaway",
  3: "Delivery",
};

// export const order_item_status = {
//   preparaing: 1,
//   ready: 2,
//   canceled: 3,
//   served: 4,
//   wasted: 5,
// };

//updated constant because of recipt
export const order_item_status = {
  preparaing: 1,
  ready: 2,
  canceled: 3,
  served: 4,
  wasted: 5,
  refunded: 6,
};

export const order_item_status_text = {
  1: "Preparaing",
  2: "Ready",
  3: "Canceled",
  4: "Served",
  5: "Wasted",
};

export const text_type = {
  none: 0,
  percentage: 1,
  number: 2,
  text: 3,
};

export const inventory_type = {
  none: "none",
  recipe: "recipe",
  standalone: "standalone",
};

export const report_type_modals = {
  saleSummary: "saleSummary",
  orderTypeSummary: "orderTypeSummary",
  pettyCash: "pettyCash",
};

export const registration_steps = {
  first_step: "first_step",
  second_step: "second_step",
  third_step: "third_step",
};

export const app_integrations = {
  paymentree: {
    id: "Paymentree",
    inputs: {
      api_key: "",
      host_id: "",
      location: "",
      developer_id: "",
      host_server_id: "",
      // terminal_id: "",
      client_id: "",
    },
  },
  viva: {
    id: "Viva",
    inputs: {
      account_id: "",
      email: "",
      // terminal_id: "",
    },
  },
  viva_direct: {
    id: "Viva Direct",
    inputs: {
      merchant_id: "",
      api_key: "",
      pos_client_id: "",
      pos_client_secret: "",
      smart_checkout_client_id: "",
      smart_checkout_client_secret: "",
    },
    terminals: [
      {
        terminal_id: "",
        device_management_id: "",
      },
    ],
  },
  apax_terminals: {
    id: "Pax Terminals",
    inputs: {
      // pair_code: "",
      // terminal_id: "",
    },
    terminals: [
      {
        ip: "",
        terminal_id: "",
        device_management_id: "",
        pair_code: "",
        auth_token: "",
      },
    ],
  },
};

export const online_payment_sources = {
  stripe: {
    id: "stripe",
    name: "Stripe",
  },
  viva_direct: {
    id: "viva_direct",
    name: "Viva Direct",
  },
  viva: {
    id: "viva",
    name: "Viva",
  },
};

export const ORDER_FILTERS_BY = {
  order_type: "order_type",
  category: "category",
  item: "item",
  order_paid_by: "order_paid_by",
  employee: "employee",
  discount: "discount",
};

export const REPORT_PAGES = {
  report: "Report",
  sales_summary: "Sales Summary",
  payment_methods: "Payment Methods",
  item_sales: "Item Sales",
  category_sales: "Category Sales",
  employee_sales: "Employee Sales",
  discount_sales: "Discount Applied",
  rush_hours: "Rush Hours",
};

export const EMPLOYEE_ATTENDANCE = {
  overview: "Employees Overview",
  today_report: "Detailed Report",
  employee_report: "Employee Details",
  employee_payroll: "Employee Payroll",
  break_time: "Manage Break Time",
};

export const SUBSCRIPTION_ITEMS = {
  merchant: "merchants",
  pos_devices: "pos_devices",
  kds_devices: "kds_devices",
  manager_access: "manager_access",
  tables: "tables",
  item_modifiers: "item_modifiers",
  report: "report",
  employee_creation: "employee_creation",
  employee_attendance: "employee_attendance",
  inventory_management: "inventory_management",
  online_store_access: "online_store_access",
};
