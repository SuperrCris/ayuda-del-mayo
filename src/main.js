import './style.css'
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const categorias = {
  todas: { label: 'Todas', icon: '✦' },
  donaciones: { label: 'Donaciones', icon: '💰' },
  voluntariado: { label: 'Voluntariado', icon: '✋' },
  busqueda: { label: 'Búsqueda', icon: '🔍' },
  logistica: { label: 'Logística', icon: '✦' },
}

const simularCategorias = [
  { id: 1, categoria: 'donaciones', titulo: 'Recolección de agua', descripcion: 'Reunimos agua embotellada para las familias afectadas por el huracán Polo.', ubicacion: 'Centro Comunitario El Mayo', fecha: 'Hoy · 10:00 a 17:00 h', necesidades: 'Agua potable y cajas' },
  { id: 2, categoria: 'donaciones', titulo: 'Despensa comunitaria', descripcion: 'Arma una despensa con alimentos no perecederos para una familia.', ubicacion: 'Plaza del Mayo', fecha: 'Sáb 12 oct · 10:00 h', necesidades: 'Arroz, frijol y aceite' },
  { id: 3, categoria: 'voluntariado', titulo: 'Limpieza de calles', descripcion: 'Ayuda a retirar lodo y escombros de las calles del barrio.', ubicacion: 'Cancha del Mayo', fecha: 'Dom 13 oct · 08:00 h', necesidades: 'Palas, guantes y botas' },
  { id: 4, categoria: 'donaciones', titulo: 'Ropa para familias', descripcion: 'Dona ropa limpia y en buen estado para personas damnificadas.', ubicacion: 'Biblioteca del barrio', fecha: 'Mar y jue · 16:00 h', necesidades: 'Ropa infantil y cobijas' },
  { id: 5, categoria: 'busqueda', titulo: 'Punto de información', descripcion: 'Apoya registrando reportes y compartiendo información verificada.', ubicacion: 'Kiosco de la plaza', fecha: 'Todos los días · 09:00 h', necesidades: 'Celular y conexión' },
  { id: 6, categoria: 'voluntariado', titulo: 'Acompañamiento médico', descripcion: 'Acompaña a personas mayores a su cita o centro de salud más cercano.', ubicacion: 'Centro de Salud El Mayo', fecha: 'Lun a vie · 08:00 h', necesidades: 'Personas voluntarias' },
]

let tareas = []
let categoriaActiva = 'todas'
const listaTareas = document.querySelector('#lista-tareas')
const contadorTareas = document.querySelector('#contador-tareas')
const mensajeTareas = document.querySelector('#mensaje-tareas')
const botonRecargar = document.querySelector('#recargar-tareas')

function mostrarOportunidades() {
  const visibles = categoriaActiva === 'todas' ? tareas : tareas.filter((item) => item.categoria === categoriaActiva)
  contadorTareas.textContent = tareas.length
  listaTareas.innerHTML = visibles.length ? visibles.map((objeto) => `<article class="tareas-tarjeta"><div class="card-top"><span class="etiqueta-categoria">${categorias[objeto.categoria].icon} ${categorias[objeto.categoria].label}</span><button class="save-button" aria-label="Guardar tarea">♡</button></div><h3>${objeto.titulo}</h3><p>${objeto.descripcion}</p><div class="card-details"><span>⌖ ${objeto.ubicacion}</span><span>◷ ${objeto.fecha}</span></div><div class="card-footer"><span class="need">Se necesita: <b>${objeto.necesidades || 'Personas voluntarias'}</b></span><a href="https://www.google.com/maps/search/${encodeURIComponent(objeto.ubicacion + ' El Mayo')}" target="_blank" rel="noreferrer" aria-label="Ver ubicación en el mapa">Mapa ↗</a></div></article>`).join('') : '<p class="empty-state">Todavía no hay tareas en esta categoría.</p>'
}

document.querySelectorAll('[data-category]').forEach((tab) => tab.addEventListener('click', () => {
  categoriaActiva = tab.dataset.category
  document.querySelectorAll('[data-category]').forEach((item) => {
    const selected = item === tab
    item.classList.toggle('active', selected)
    item.setAttribute('aria-selected', selected)
  })
  mostrarOportunidades()
}))

const dialog = document.querySelector('#opportunity-dialog')
document.querySelectorAll('[data-open-form]').forEach((button) => button.addEventListener('click', () => dialog.showModal()))
document.querySelector('[data-close-form]').addEventListener('click', () => dialog.close())
document.querySelector('#opportunity-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const formulario = event.currentTarget
  const data = new FormData(formulario)
  const boton = formulario.querySelector('button[type="submit"]')
  boton.disabled = true
  try {
    await addDoc(collection(db, 'tareas'), {
      titulo: data.get('titulo'),
      categoria: data.get('categoria'),
      descripcion: data.get('descripcion'),
      ubicacion: data.get('ubicacion'),
      fecha: data.get('fecha'),
      necesidades: 'Personas voluntarias',
      creadoEn: serverTimestamp(),
    })
    formulario.reset()
    dialog.close()
    mensajeTareas.textContent = 'Tu tarea ya está disponible. Pulsa Recargar para verla.'
  } catch (error) {
    console.error('No se pudo publicar la tarea:', error)
    alert('No se pudo publicar la tarea. Revisa tu conexión e inténtalo de nuevo.')
  } finally {
    boton.disabled = false
  }
})

async function prepararTareasIniciales() {
  const tareasGuardadas = JSON.parse(localStorage.getItem('adm-oportunidades') || 'null')
  const tareasIniciales = tareasGuardadas || simularCategorias
  const existentes = await getDocs(collection(db, 'tareas'))
  if (existentes.empty) {
    await Promise.all(tareasIniciales.map((tarea) => addDoc(collection(db, 'tareas'), { ...tarea, creadoEn: serverTimestamp() })))
  }
}

async function cargarTareas() {
  botonRecargar.disabled = true
  botonRecargar.classList.add('cargando')
  try {
    const snapshot = await getDocs(collection(db, 'tareas'))
  tareas = snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() }))
  mostrarOportunidades()
    contadorTareas.textContent = tareas.length
    mensajeTareas.textContent = ''
  } catch (error) {
  console.error('No se pudieron recibir las tareas:', error)
  listaTareas.innerHTML = '<p class="empty-state">No se pudieron cargar las tareas. Revisa la conexión con Firebase.</p>'
    mensajeTareas.textContent = 'No se pudieron cargar las tareas.'
  } finally {
    botonRecargar.disabled = false
    botonRecargar.classList.remove('cargando')
  }
}

botonRecargar.addEventListener('click', cargarTareas)

prepararTareasIniciales()
  .then(cargarTareas)
  .catch((error) => {
    console.error('No se pudieron crear las tareas iniciales:', error)
    cargarTareas()
  })
