// import Express from 'express'
// import Bcrypt from 'bcryptjs'
// import { validateAll } from 'indicative/validator'

// type AuthData = { email: string; password: string; name?: string }

// class ForgotPasswordController {
//     public forgotPassword = async (
//         request: Express.Request,
//         response: Express.Response
//     ) => {
//         const { body, resources, Mailer, resourceManager } = request
//         const { email } = await validateAll(body, {
//             email: 'required|email',
//         })

//         const UserModel = resources[this.userResource().data.slug].Model()

//         const PasswordResetModel = resources[
//             this.passwordResetsResource().data.slug
//         ].Model()

//         const existingUser = await UserModel.where({
//             email,
//         }).fetch({
//             require: false,
//         })

//         const existingPasswordReset = await PasswordResetModel.where({
//             email,
//         }).fetch({
//             require: false,
//         })

//         if (!existingUser) {
//             return response.status(422).json([
//                 {
//                     field: 'email',
//                     message: 'Invalid email address.',
//                 },
//             ])
//         }

//         const token =
//             Randomstring.generate(32) + Uniqid() + Randomstring.generate(32)

//         const expiresAt = Dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')

//         if (existingPasswordReset) {
//             // make sure it has not expired
//             await PasswordResetModel.query()
//                 .where({
//                     email,
//                 })
//                 .update({
//                     token,
//                     expires_at: expiresAt,
//                 })
//         } else {
//             await PasswordResetModel.forge({
//                 email,
//                 token,
//             }).save()
//         }

//         Mailer.to(email, existingUser.get('name')).sendRaw(
//             `Some raw message to send with the token ${token}`
//         )

//         return response.json({
//             message: `Please check your email for steps to reset your password.`,
//         })
//     }

//     public register = async (
//         request: Express.Request,
//         response: Express.Response
//     ) => {
//         if ((await request.db.getAdministratorsCount()) > 0) {
//             return response.status(422).json({
//                 message:
//                     'An administrator user already exists. Please use the administration management dashboard to add more users.',
//             })
//         }

//         const [validationPassed, errors] = await this.validate(
//             request.body,
//             true
//         )

//         if (!validationPassed) {
//             return response.status(422).json({
//                 message: 'Validation failed.',
//                 errors,
//             })
//         }

//         const userId = await request.resourceManager.createAdmin(
//             request,
//             request.administratorResource,
//             {
//                 name: request.body.name,
//                 email: request.body.email,
//                 password: request.body.password,
//             }
//         )

//         request.session!.user = userId

//         return response.json({
//             message: 'Registration and login successful.',
//         })
//     }

//     public validate = async (data: AuthData, registration = false) => {
//         let rules: {
//             [key: string]: string
//         } = {
//             email: 'required|email',
//             password: 'required|min:8',
//         }

//         if (registration) {
//             rules.name = 'required'
//         }

//         try {
//             await validateAll(data, rules, {
//                 'email.required': 'The email is required.',
//                 'password.required': 'The password is required.',
//                 'name.required': 'The name is required.',
//             })

//             return [true, []]
//         } catch (errors) {
//             return [false, errors]
//         }
//     }
// }

// export default new ForgotPasswordController()
