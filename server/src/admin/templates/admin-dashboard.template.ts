import { AdminDashboardScript } from './admin-dashboard.script';

export const getAdminDashboardTemplate = (
  stats: {
    playersCount: number;
    version: string;
  },
  docFiles: { filename: string; title: string }[] = [],
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
        
        html, body { 
          height: 100%; 
          width: 100%; 
          overflow: hidden; 
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
        }

        body {
          display: grid;
          grid-template-rows: auto 1fr auto;
          background-image: radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.08) 0%, transparent 60%);
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
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          padding: 2rem 4rem;
          overflow: hidden;
          min-height: 0;
        }

    
        .sidebar {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          min-height: 0;
        }

        *::-webkit-scrollbar { width: 5px; height: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: var(--accent); }

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

        .dashboard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          min-height: 0;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(5px);
          text-align: center;
          transition: all 0.4s;
          margin-bottom: 1.5rem;
          width: 100%;
          max-width: 450px;
        }

        .card:hover {
           border-color: var(--accent);
           box-shadow: 0 0 30px var(--accent-glow);
        }

        .stat-label { color: var(--text-dim); font-size: 1rem; margin-bottom: 0.5rem; }
        .stat-value { font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; }

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
          cursor: pointer;
          border: none;
        }

        .btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

        #modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(5, 11, 24, 0.8);
          backdrop-filter: blur(20px);
          display: none;
          z-index: 100;
          overflow-y: auto;
          padding: 0; 
        }

        .modal-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          padding: 6rem 2rem 4rem 2rem;
        }

        .close-btn {
          position: fixed;
          top: 2rem; right: 2rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid var(--border);
          color: #fff;
          width: 44px; height: 44px; 
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.2s;
          z-index: 150; 
          backdrop-filter: blur(5px);
        }
        .close-btn:hover { background: var(--accent); color: var(--bg); }

        .markdown-body { 
          color: var(--text); 
          line-height: 1.6;
        }
        .markdown-body h1 { font-size: 2.5rem; margin-bottom: 2rem; color: var(--accent); }
        .markdown-body h2 { font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 1rem; color: var(--text-dim); }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1.5rem; padding-left: 2rem; }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .markdown-body pre { background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 16px; margin: 1.5rem 0; overflow-x: auto; border: 1px solid var(--border); }
        .markdown-body table { 
          display: block;
          width: 100%; 
          overflow-x: auto;
          border-collapse: collapse; 
          margin: 2rem 0; 
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .markdown-body table::-webkit-scrollbar { height: 5px; }
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

        .input-group { margin-bottom: 1.5rem; text-align: left; }
        .input-group label { display: block; margin-bottom: 0.5rem; color: var(--text-dim); }
        .input-group input { width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; color: var(--text); outline: none; transition: border-color 0.2s; font-family: inherit; }
        .input-group input:focus { border-color: var(--accent); }
        
        .input-group input:-webkit-autofill,
        .input-group input:-webkit-autofill:hover, 
        .input-group input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text);
          -webkit-box-shadow: 0 0 0px 1000px #050b18 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        .input-error { border-color: #ef4444 !important; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
        .error-msg { color: #ef4444; font-size: 0.8rem; margin-top: 0.5rem; text-align: left; display: none; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: none;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-loading { pointer-events: none; opacity: 0.8; }
        .btn-loading .spinner { display: inline-block; margin-right: 8px; }
        .btn-loading .btn-text { vertical-align: middle; }
        .btn-success { 
          background: #10b981 !important; 
          color: white !important; 
          pointer-events: none; 
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4) !important;
        }

        @media (max-width: 850px) {
          html, body { height: auto; overflow: auto; }
          body { display: block; }
          main { 
            display: flex; 
            flex-direction: column; 
            padding: 1.5rem; 
            gap: 1.5rem;
          }
          header { padding: 1.5rem; flex-direction: column; gap: 1rem; text-align: center; }
          footer { padding: 1.5rem; flex-direction: column; gap: 1rem; align-items: center; text-align: center; }
          
          .dashboard-content { order: 1; width: 100%; }
          .sidebar { order: 2; overflow-y: visible; max-height: none; }
          
          .card { padding: 1.5rem; margin-bottom: 1.5rem; }
          #modal { padding: 0; }
          .modal-container { padding: 5rem 1.5rem 3rem 1.5rem; }
          .close-btn { top: 1rem; right: 1rem; }
          .markdown-body h1 { font-size: 1.8rem; }
          .stat-value { font-size: 3rem; }
          
          .btn { padding: 12px 24px; font-size: 0.9rem; width: 100%; text-align: center; }
        }
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
                (doc) => `
              <div class="doc-link" onclick="openDoc('${doc.filename}')">
                <i>📄</i>
                <span>${doc.title}</span>
              </div>
            `,
              )
              .join('')}
        </div>

        <div class="dashboard-content">
          <div class="card">
            <div class="stat-label">Total Registered Players</div>
            <div class="stat-value">${stats.playersCount.toLocaleString()}</div>
          </div>
          
          <a href="javascript:void(0)" onclick="checkSwagger()" class="btn">EXPLORE API ENDPOINTS</a>

          <div class="card" style="margin-top: 2rem; padding: 2rem;">
            <div class="stat-label" style="margin-bottom: 1.5rem;">Moderator Tools</div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <a href="javascript:void(0)" id="btn-login-mod" onclick="openLoginModal()" class="btn" style="padding: 12px 24px; font-size: 0.9rem;">LOGIN</a>
              <a href="javascript:void(0)" id="btn-ban-user" onclick="openBanModal()" class="btn" style="display: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 24px; font-size: 0.9rem;">BAN USER</a>
              <a href="javascript:void(0)" id="btn-unban-user" onclick="openUnbanModal()" class="btn" style="display: none; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 12px 24px; font-size: 0.9rem;">UNBAN USER</a>
            </div>
          </div>
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
        (${AdminDashboardScript.toString()})();
      </script>
    </body>
    </html>
  `;
};
