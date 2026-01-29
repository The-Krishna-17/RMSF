const { z } = require("zod");

const signupSchema = z.object({
  restaurantName: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters"),
  panNumber: z.string().min(5, "Invalid PAN number"),
  contactInfo: z
    .string()
    .min(10, "Contact info must be at least 10 characters"),
  address: z.string().min(5, "Address is too short"),
  logo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  paymentTypes: z.array(z.string()).optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

module.exports = {
  signupSchema,
  loginSchema,
};
