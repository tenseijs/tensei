<script>
export default {
  name: 'CarbonAds',

  watch: {
    '$route' (to, from) {
      if (
        to.path !== from.path
        // Only reload if the ad has been loaded
        // otherwise it's possible that the script is appended but
        // the ads are not loaded yet. This would result in duplicated ads.
        && this.$el.querySelector('#carbonads')
      ) {
        this.$el.innerHTML = ''
        this.load()
      }
    }
  },

  mounted () {
    this.load()
  },

  methods: {
    load () {
      const s = document.createElement('script')
      s.id = '_carbonads_js'
      s.src = `//cdn.carbonads.com/carbon.js?serve=CE7I62JL&placement=novalaravelcom`
      this.$el.appendChild(s)
    }
  },

  render (h) {
    return h('div', { class: 'carbon-ads' })
  }
}
</script>

<style lang="stylus">
.carbon-ads
  min-height 102px
  padding 1.5rem 1.5rem 0
  margin-bottom -0.5rem
  font-size 0.75rem
  a
    color #fff
    font-weight normal
    display inline
  .carbon-img
    display inline-block
    border 1px solid $borderColor
    margin-bottom 10px
    img
      display block
  .carbon-text
      display block
      clear left
  .carbon-poweredby
    color rgba(255, 255, 255, 0.5)
    display block
    margin-top 0.5em

@media (max-width: $MQMobile)
  .carbon-ads
    .carbon-img img
      width 100px
      height 77px
</style>
