import { useCallback, useEffect, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import type { Restaurant } from '../schema/restaurant'
import { useAppStore } from '../store/useAppStore'
import { StarRating } from './StarRating'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

function createNumberedIcon(num: number) {
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker"><span>${num}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function InitialBounds({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current || !restaurants.length) return
    fitted.current = true
    if (restaurants.length === 1) {
      map.setView([restaurants[0].latitude, restaurants[0].longitude], 12)
    } else {
      const bounds = L.latLngBounds(
        restaurants.map((r) => [r.latitude, r.longitude] as L.LatLngTuple)
      )
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
    }
  }, [map, restaurants])

  return null
}

function FlyToSelected({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap()
  const selectedId = useAppStore((s) => s.selectedRestaurantId)
  const prevId = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return
    prevId.current = selectedId
    const r = restaurants.find((rest) => rest.id === selectedId)
    if (r) {
      map.flyTo([r.latitude, r.longitude], 14, { duration: 1.2 })
    }
  }, [selectedId, restaurants, map])

  useEffect(() => {
    if (!selectedId) {
      prevId.current = null
    }
  }, [selectedId])

  return null
}

function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const parent = container.parentElement
    if (!parent) return

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [map])

  return null
}

export function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  const setSelectedRestaurantId = useAppStore((s) => s.setSelectedRestaurantId)

  const handleSelect = useCallback(
    (r: Restaurant) => {
      setSelectedRestaurantId(r.id)
    },
    [setSelectedRestaurantId]
  )

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialBounds restaurants={restaurants} />
        <FlyToSelected restaurants={restaurants} />
        <MapResizeHandler />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          iconCreateFunction={(cluster: L.MarkerCluster) => {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `<div style="
                background: #f97316;
                color: white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 13px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">${count}</div>`,
              className: '',
              iconSize: L.point(36, 36),
            })
          }}
        >
          {restaurants.map((r, idx) => (
            <Marker
              key={r.id}
              position={[r.latitude, r.longitude]}
              icon={restaurants.length <= 50 ? createNumberedIcon(idx + 1) : defaultIcon}
              eventHandlers={{
                click: () => handleSelect(r),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[220px]">
                  {r.imageUrl && (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {r.rating != null && <StarRating rating={r.rating} size="sm" />}
                    {r.reviewCount != null && (
                      <span className="text-xs text-gray-500">{r.reviewCount} reviews</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{r.address}</div>
                  {r.certification && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {r.certification} Certified
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-2 w-full bg-brand hover:bg-brand-dark text-white text-xs font-semibold py-1.5 rounded-md transition-colors"
                    onClick={() => handleSelect(r)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
