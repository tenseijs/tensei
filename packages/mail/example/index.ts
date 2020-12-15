import Mail from '@tensei/mail'

Mail.use('receipts')
	.send(
		(message) => {
			message.htmlView('welcome.edge')
			message.htmlView('welcome.edge')
		},
		{
			oTags: ['newsletter'],
			oDeliverytime: new Date(),
		}
	)
	.then((reponse) => {
		console.log(reponse)
	})
