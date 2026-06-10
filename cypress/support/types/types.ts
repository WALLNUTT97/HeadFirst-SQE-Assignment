export interface TestUserFixture {
  emailPrefix: string
  password: string
  securityAnswer: string
}

export interface RegisteredUser {
  email: string
  password: string
  token: string
  basketId: number
}

export interface CheckoutAddress {
  country: string, 
  fullName: string, 
  mobileNumber: string, 
  zipCode: string, 
  streetAddress: string, 
  city: string, 
  state?: string
}

export interface PaymentOption {
  fullName: string
  cardNum: string
  expMonth: string
  expYear: string
}