import { DataSource } from 'typeorm'
import { States } from '~/modules/states/states.entity'
import { Cities } from '~/modules/cities/cities.entity'
import axios from 'axios'

interface State {
  id: number
  nome: string
  sigla: string
}

interface City {
  id: number
  nome: string
}

export async function seedCities(dataSource: DataSource) {
  const stateRepo = dataSource.getRepository(States)
  const cityRepo = dataSource.getRepository(Cities)

  console.log('Initializing states and cities seed...')

  // Get states
  const statesResponse = await axios.get<State[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')

  const states = statesResponse.data

  for (const state of states) {
    // UPSERT state
    await stateRepo
      .createQueryBuilder()
      .insert()
      .values({
        id: state.id,
        name: state.nome,
        acronym: state.sigla,
      })
      .orIgnore() // avoid duplicates
      .execute()

    console.log(`State ${state.sigla}`)

    // Get cities of state
    const citiesResponse = await axios.get<City[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.id}/municipios`,
    )

    const cities = citiesResponse.data

    // Insert cities in batch (better performance)
    const cityValues = cities.map((city: City) => ({
      id: city.id,
      name: city.nome,
      stateId: state.id, // FK
    }))

    await cityRepo
      .createQueryBuilder()
      .insert()
      .values(cityValues)
      .orIgnore() // avoid duplicates
      .execute()

    console.log(`${cities.length} cities of state ${state.sigla}`)
  }

  console.log('Seed finished!')
}
