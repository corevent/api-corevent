export function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11) return false

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let j = 10
  let sum = 0
  for (let i = 0; i < cpf.length - 2; i++) {
    if (isNaN(Number(cpf[i]))) {
      return false
    }

    sum += Number(cpf[i]) * j
    j--
  }

  const firstRemainder = (sum * 10) % 11
  const firstDigit = firstRemainder === 10 ? 0 : firstRemainder

  j = 11
  sum = 0
  for (let i = 0; i < cpf.length - 1; i++) {
    sum += Number(cpf[i]) * j
    j--
  }

  const secondRemainder = (sum * 10) % 11
  const secondDigit = secondRemainder === 10 ? 0 : secondRemainder

  if (firstDigit !== Number(cpf[9]) || secondDigit !== Number(cpf[10])) {
    return false
  }

  return true
}

export function isValidCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) return false

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false
  }

  let j = 5
  let sum = 0
  for (let i = 0; i < cnpj.length - 2; i++) {
    if (isNaN(Number(cnpj[i]))) {
      return false
    }

    sum += Number(cnpj[i]) * j
    j--
    j = j < 2 ? 9 : j
  }

  const firstRemainder = (sum * 10) % 11
  const firstDigit = firstRemainder === 0 || firstRemainder === 1 ? 0 : 11 - firstRemainder

  j = 6
  sum = 0
  for (let i = 0; i < cnpj.length - 1; i++) {
    if (isNaN(Number(cnpj[i]))) {
      return false
    }

    sum += Number(cnpj[i]) * j
    j--
    j = j < 2 ? 9 : j
  }

  const secondRemainder = (sum * 10) % 11
  const secondDigit = secondRemainder === 0 || secondRemainder === 1 ? 0 : 11 - secondRemainder

  if (firstDigit !== Number(cnpj[12]) || secondDigit !== Number(cnpj[13])) {
    return false
  }

  return true
}
