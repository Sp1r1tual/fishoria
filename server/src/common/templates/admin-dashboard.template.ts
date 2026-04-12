export const getAdminDashboardTemplate = (
  stats: {
    playersCount: number;
    version: string;
  },
  docFiles: string[] = [],
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fishoria Admin Panel</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
      <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
      <style>
        :root {
          --bg: #050b18;
          --card-bg: rgba(255, 255, 255, 0.05);
          --accent: #00f2ff;
          --accent-glow: rgba(0, 242, 255, 0.3);
          --text: #e0e6ed;
          --text-dim: #94a3b8;
          --border: rgba(255, 255, 255, 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100vh;
          overflow: hidden;
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.08) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
        }

        header {
          padding: 1.5rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -1px; }
        .logo span { color: var(--accent); text-shadow: 0 0 10px var(--accent-glow); }

        .status-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-dot {
          width: 8px; height: 8px; background: #10b981; border-radius: 50%;
          box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        main {
          flex: 1;
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          padding: 2rem 4rem;
          overflow: hidden;
        }

        /* Wiki Sidebar */
        .sidebar {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .sidebar-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
        }

        .doc-link {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
          border-radius: 12px;
          color: var(--text);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .doc-link:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--accent);
          transform: translateX(5px);
        }

        .doc-link i { color: var(--accent); opacity: 0.7; }

        /* Dashboard Content */
        .dashboard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 3rem;
          backdrop-filter: blur(5px);
          text-align: center;
          transition: all 0.4s;
          margin-bottom: 2rem;
          width: 100%;
          max-width: 500px;
        }

        .card:hover {
           border-color: var(--accent);
           box-shadow: 0 0 30px var(--accent-glow);
        }

        .stat-label { color: var(--text-dim); font-size: 1.1rem; margin-bottom: 1rem; }
        .stat-value { font-size: 5rem; font-weight: 800; letter-spacing: -2px; }

        .btn {
          display: inline-block;
          background: var(--accent);
          color: #050b18;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 14px;
          font-weight: 800;
          transition: all 0.3s;
          box-shadow: 0 4px 15px var(--accent-glow);
        }

        .btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

        /* Modal Viewer */
        #modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(5, 11, 24, 0.8);
          backdrop-filter: blur(20px);
          display: none;
          z-index: 100;
          padding: 4rem;
          overflow-y: auto;
        }

        .modal-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }

        .close-btn {
          position: fixed;
          top: 2rem; right: 2rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid var(--border);
          color: #fff;
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
        }
        .close-btn:hover { background: var(--accent); color: var(--bg); }

        /* Markdown Styles */
        .markdown-body { color: var(--text); line-height: 1.6; }
        .markdown-body h1 { font-size: 2.5rem; margin-bottom: 2rem; color: var(--accent); }
        .markdown-body h2 { font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 1rem; color: var(--text-dim); }
        .markdown-body ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .markdown-body pre { background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 16px; margin: 1.5rem 0; overflow-x: auto; border: 1px solid var(--border); }
        .markdown-body table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .markdown-body th, .markdown-body td { padding: 12px; border: 1px solid var(--border); text-align: left; }
        .markdown-body th { background: rgba(255,255,255,0.05); color: var(--accent); }

        footer {
          padding: 1.5rem 4rem;
          border-top: 1px solid var(--border);
          font-size: 0.85rem;
          color: var(--text-dim);
          display: flex;
          justify-content: space-between;
          z-index: 10;
        }

        .highlight { color: #fff; }
        .footer-link { color: var(--accent); text-decoration: none; }
      </style>
    </head>
    <body>
      <header>
        <div class="logo"><span>FISHORIA</span> API</div>
        <div class="status-badge">
          <div class="status-dot"></div>
          SERVER OPERATIONAL
        </div>
      </header>

      <main>
        <div class="sidebar">
          <div class="sidebar-title">Internal Wiki</div>
          ${docFiles
            .map(
              (file) => `
            <div class="doc-link" onclick="openDoc('${file}')">
              <i>📄</i> ${file.replace('.md', '').replace('_', ' ')}
            </div>
          `,
            )
            .join('')}
          <div style="flex: 1"></div>
          <div class="sidebar-title">Stats</div>
          <div style="font-size: 0.8rem; color: var(--text-dim)">Built with NestJS & Prisma</div>
        </div>

        <div class="dashboard-content">
          <div class="card">
            <div class="stat-label">Total Registered Players</div>
            <div class="stat-value">${stats.playersCount.toLocaleString()}</div>
          </div>
          
          <a href="javascript:void(0)" onclick="checkSwagger()" class="btn">EXPLORE API ENDPOINTS</a>
        </div>
      </main>

      <div id="modal">
        <div class="close-btn" onclick="closeDoc()">&times;</div>
        <div class="modal-container">
          <div id="doc-content" class="markdown-body">
            Loading...
          </div>
        </div>
      </div>

      <footer>
        <div>v${stats.version} &bull; Developed by <b class="highlight">Atmosphoria Software</b></div>
        <div>
          <a href="mailto:atmosphoria.software@gmail.com" class="footer-link">Support Inbox</a>
        </div>
      </footer>

      <script>
        async function checkSwagger() {
          try {
            const response = await fetch('/api', { method: 'HEAD' });
            if (response.ok) {
              window.location.href = '/api';
            } else {
              showDocMessage('🚧 Swagger Documentation', 'The Swagger documentation is still in the formative stage. Please use the internal Wiki on the left to familiarize yourself with the architecture.');
            }
          } catch (e) {
            showDocMessage('🚧 Swagger Documentation', 'The API documentation service is currently unavailable or has not yet been formed.');
          }
        }

        function showDocMessage(title, message) {
          const modal = document.getElementById('modal');
          const content = document.getElementById('doc-content');
          modal.style.display = 'block';
          content.innerHTML = '<h1>' + title + '</h1><p style="font-size: 1.2rem; margin-top: 2rem;">' + message + '</p>';
        }

        async function openDoc(filename) {

          const modal = document.getElementById('modal');
          const content = document.getElementById('doc-content');
          
          modal.style.display = 'block';
          content.innerHTML = '<div style="text-align: center; padding: 4rem;"><h1>Loading...</h1></div>';
          
          try {
            const response = await fetch('/api/docs-content/' + filename);
            const data = await response.json();
            content.innerHTML = data.html;
          } catch (error) {
            content.innerHTML = '<h1>Error loading documentation</h1><p>' + error.message + '</p>';
          }
        }

        function closeDoc() {
          document.getElementById('modal').style.display = 'none';
        }

        // Close on ESC
        window.onkeydown = function(event) {
          if (event.keyCode === 27) closeDoc();
        }
      </script>
    </body>
    </html>
  `;
};
