import { Link } from 'react-router-dom'

export default function Guide() {
  return (
    <main className="guide-page">
      <div className="guide-header">
        <p className="eyebrow">Print Guide</p>
        <h1>How to print at IU campuses</h1>
        <p>
          A compact editorial-style guide for students, staff, and guests who
          want to find printers fast.
        </p>
      </div>

      <article className="guide-article">
        <section>
          <h2>How to print</h2>
          <p>
            Most IU printers require your university credentials and a valid
            printing account. Log in through the campus printing portal before
            you send a job, then collect it at the printer location.
          </p>
          <ul>
            <li>Choose the correct campus before searching.</li>
            <li>Find a nearby printer on the map.</li>
            <li>Send your job and pick it up promptly.</li>
          </ul>
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
            <Link to="https://uits.iu.edu/services/printing" target="_blank">IU Printing Services</Link>.
          </p>
        </section>
      </article>
    </main>
  )
}
