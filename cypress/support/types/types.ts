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