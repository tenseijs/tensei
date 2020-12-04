import Trix from './fields/Trix'
import TrixDetail from './detail-fields/Trix'

import 'trix/dist/trix.css'

const TrixField = 'TrixField'

Tensei.booting(function() {
    this.field(TrixField, Trix)

    this.detailField(TrixField, TrixDetail)
    this.indexField(TrixField, this.indexFieldComponents['TextareaField'])
})
