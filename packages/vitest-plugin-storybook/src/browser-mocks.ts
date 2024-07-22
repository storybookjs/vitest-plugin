// if we ever want to expose this...
const { getComputedStyle: _getComputedStyle } = window
window.getComputedStyle = (elt) => _getComputedStyle(elt)
window.scrollTo = () => {}
