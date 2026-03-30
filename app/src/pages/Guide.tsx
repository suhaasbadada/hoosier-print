import { Link } from 'react-router-dom'

export default function Guide() {
  return (
    <main className="guide-page">
      <div className="guide-header">
        {/* <p className="eyebrow">Print Guide</p> */}
        <h1>How to print at IU campuses</h1>
        <p>
          A compact editorial-style guide for students, staff, and guests who
          want to find printers fast.
        </p>
      </div>

      <article className="guide-article">
        <section>
          <h2>How to print</h2>
          <h3>Mobile</h3>
          <ol>
            <li>Save your document to cloud storage (Google Drive suggested).</li>
            <li>Navigate to <a href="https://mobile.print.iu.edu/myprintcenter/" target="_blank" rel="noreferrer noopener">My Print Center</a> and sign in with IU credentials.</li>
            <li>Select Upload → Browse → choose your cloud service and file.</li>
            <li>Select Color in Print Options if needed.</li>
            <li>Tap your IU ID card to the nearest printer and print.</li>
          </ol>
          <h3>Laptop</h3>
          <ol>
            <li>Open <a href="https://mobile.print.iu.edu/myprintcenter/" target="_blank" rel="noreferrer noopener">My Print Center</a> in your browser and sign in with IU credentials.</li>
            <li>Select Upload in the upper left and browse for your file.</li>
            <li>Select Color in Print Options if needed.</li>
            <li>Tap your IU ID card to the nearest printer and print.</li>
          </ol>
        </section>

        <section>
          <h2>Printer locations</h2>
          <p>
            This app maps IU printers across campuses and highlights the closest
            options to your current location. Use the filter to focus the view
            on the campus you need.
          </p>
          <p>
            Campus buildings, study halls, and lab spaces are all represented in
            the dataset so you can plan a quick on-campus stop.
          </p>
        </section>

        <section>
          <h2>Common issues</h2>
          <p>
            If a printer is not available, refresh the page and try a different
            campus. Location permission must be granted for the nearest printer
            feature to work.
          </p>
          <ol>
            <li>Allow geolocation access in your browser.</li>
            <li>Check your campus selection if results seem empty.</li>
            <li>Use the retry button to request location again.</li>
          </ol>
        </section>

        <section className="guide-footer">
          <p>
            For official IU printing policies and help, visit
            {' '}
            <Link to="https://libraries.indiana.edu/printers-technology" target="_blank">site</Link>.
          </p>
        </section>
      </article>

      <div className="branding-footer">
        Built by <a href="https://linkedin.com/in/suhaasbadada" target="_blank" rel="noreferrer noopener">Suhaas Badada</a> (and Copilot)
      </div>
    </main>
  )
}
