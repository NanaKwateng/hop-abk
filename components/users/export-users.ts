import * as XLSX from "xlsx"

export function exportUsersExcel(users: any[]) {

    const worksheet = XLSX.utils.json_to_sheet(users)

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Users"
    )

    XLSX.writeFile(workbook, "users.xlsx")
}

export function exportUsersCSV(users: any[]) {

    const worksheet = XLSX.utils.json_to_sheet(users)

    const csv = XLSX.utils.sheet_to_csv(worksheet)

    const blob = new Blob([csv])

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = "users.csv"
    a.click()
}