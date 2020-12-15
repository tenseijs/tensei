declare module '@tensei/mail' {
	interface MailersList {
		promotional: MailDrivers['smtp']
		transactional: MailDrivers['ses']
		receipts: MailDrivers['mailgun']
	}
}
