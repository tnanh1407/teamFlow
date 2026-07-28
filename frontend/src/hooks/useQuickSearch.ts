// import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import Swal from "sweetalert2"
import {theme} from "@/utils/theme"

const useQuickSearch = (onSearch : (key : string) => void) => {

  // const [query, setQuery] = useState<string>("")
  const handleQuickSearch = async () => {
    const { value: keyword } = await Swal.fire({
      title: "Tìm Kiếm Nhanh",
      input: "text",
      inputPlaceholder: "Nhập tên nhân viên , phòng ban , dự án , ...",
      showCancelButton: true,
      confirmButtonText : "Tìm kiếm",
      cancelButtonText : "Hủy",
      confirmButtonColor: theme.success,
      cancelButtonColor : theme.danger,
      width: 600,
      inputAutoFocus: true,
      showCloseButton : true,
    })
    if (!keyword) return;
    if(keyword){
      onSearch(keyword);
    }
  }

  useHotkeys("ctrl+k", (e) => {
    e.preventDefault()
    handleQuickSearch();
  })

  return { handleQuickSearch }
}

export default useQuickSearch