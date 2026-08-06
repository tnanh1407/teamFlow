import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const BaseSwal = Swal.mixin({
  theme: "material-ui",
  buttonsStyling: false,
  customClass: {
    popup: "swal-theme-popup max-h-[calc(100vh-1rem)] overflow-y-auto",
    title: "swal-theme-title",
    htmlContainer: "swal-theme-html",
    confirmButton: "swal-theme-confirm",
    cancelButton: "swal-theme-cancel",
    closeButton: "swal-theme-close",
  },
})

export const MySwal = withReactContent(BaseSwal)
