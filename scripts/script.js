      const SUPABASE_URL = "https://fypmjxgtdioofpbpxdqg.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cG1qeGd0ZGlvb2ZwYnB4ZHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTc5OTgsImV4cCI6MjA4ODEzMzk5OH0.ovVLcMN6ZB6CzB4VZzL0sm0-WRLPsSjks-1FzQMwDRo";
      const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


      // ── Mapa ───────────────────────────────────────────────
      const map = L.map('map').setView([25.5393, -103.4868], 13);

     cargarMarcadores();
      const streetLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      );

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles © Esri — Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS User Community'
        }
      );

      streetLayer.addTo(map);

      
      // ── Botones de capa ────────────────────────────────────
      document.getElementById('btn-street').addEventListener('click', () => {
        map.removeLayer(satelliteLayer);
        map.addLayer(streetLayer);
      });

      document.getElementById('btn-satellite').addEventListener('click', () => {
        map.removeLayer(streetLayer);
        map.addLayer(satelliteLayer);
      });

      // ── Dialog ─────────────────────────────────────────────
      const dialog    = document.getElementById('eypopup');
      const form      = document.getElementById('marker-form');
      const btnCancel = document.querySelector('.button-cancel');

      map.on('click', (e) => {
        L.marker([25.524723, -103.4868]).addTo(map)
    .bindPopup('tallea aqui')
    .openPopup();

        document.getElementById('input-latitude').value  = e.latlng.lat.toFixed(6);
        document.getElementById('input-longitude').value = e.latlng.lng.toFixed(6);
        document.getElementById('place-name').value = '';
        dialog.showModal();
      });

      btnCancel.addEventListener('click', () => dialog.close());

      // ── Guardar marcador + Supabase ────────────────────────
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('place-name').value;
        const lat  = parseFloat(document.getElementById('input-latitude').value);
        const lng  = parseFloat(document.getElementById('input-longitude').value);

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>Lat: ${lat}<br>Lng: ${lng}`)
          .openPopup();

        const { error } = await supabaseClient.from('clicks').insert({
          name: name,
          latitude: lat,
          longitude: lng
        });

        if (error) {
          console.error('Error al guardar en Supabase:', error.message);
          alert('No se pudo guardar el marcador. Revisa la consola.');
        } else {
          console.log('Marcador guardado correctamente ✅');
        }

        dialog.close();
      });


      
  async function cargarMarcadores() {
  console.log("Cargando marcadores desde Supabase...");
  const { data, error } = await supabaseClient
    .from("clicks")
    .select("*");

  if (error) {
    console.error("Error al cargar marcadores:", error);
    return;
  }

//nsole.log(`Marcadores cargados: ${data}`);

  data.forEach((item) => {
    const marker = L.marker([item.latitude, item.longitude])
      .addTo(map)
      .bindPopup(`<b>${item.name ?? "Sin nombre"}</b><br>Lat: ${item.latitude}<br>Lng: ${item.longitude}`).addTo(map);

    
  });
}