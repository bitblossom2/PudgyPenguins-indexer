import { useEffect, useState } from 'react'

const HASURA_URL = "http://localhost:8080/v1/graphql";

// Green bar animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .img-fallback { position: relative; overflow: hidden; } /* Asegura que la línea no se salga del cuadrito */
    .img-fallback::after {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 1px; /* Línea más fina */
    background: rgba(0, 255, 65, 0.5);
    box-shadow: 0 0 5px #00ff41;
    animation: scan 3s linear infinite; /* Más lenta */
    z-index: 10;
  }  @keyframes scan {
    0% { top: -10%; }
    100% { top: 110%; }
  }
  `;
  document.head.appendChild(style);
}

export default function App() {
  const [loyal, setloyal] = useState<any[]>([]);
  const [burned, setBurned] = useState<any[]>([]);
  const [monthlyBurnCount, setMonthlyBurnCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  useEffect(() => {

  // Index data (Envio)
  const fetchData = async () => {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      const query = `
      query GetDashboardData($since: Int!) {
        loyal: PudgyPenguins_Account(
        limit: 10,
        order_by: {mintedAt: asc},
        where: {isOriginalOwner: {_eq: true}}
        ) {
        id
        currentOwner
        mintedAt
      }

      recentActivity: PudgyPenguins_Transfer(
        limit: 10,
        order_by: {id: desc} # O por blockNumber si lo tienes
      ) {
        id
        from
        to
        tokenId
      }

      burned: PudgyPenguins_Account(
        limit: 5,
        order_by: {lastUpdatedBlock: desc},
        where: {isBurned: {_eq: true}}
        ) {
        id
        lastUpdatedBlock
        mintedAt
      }

      monthlyBurnData: PudgyPenguins_Account(
        where: {isBurned: {_eq: true}, mintedAt: {_gte: $since}}
        ) {
        id
      }

    }`;


    try {
      const res = await fetch(HASURA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { since: thirtyDaysAgo } }),
      });

      const json = await res.json();
      if (json.data) {
        setloyal(json.data.loyal);
        setBurned(json.data.burned);
        setMonthlyBurnCount(json.data.monthlyBurnData.length);
        setRecentActivity(json.data.recentActivity);
      }
    } catch (e) {
      console.error(" CONNECTION ERROR:", e);
    }
  };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>

      {/* Left badge */}
      <div style={styles.liveBadge}>
        <span style={styles.pulseDot}></span>
        <span style={{ color: '#00ff41', fontWeight: 'bold' }}>NETWORK_UPLINK: ESTABLISHED</span>
        <span style={{ color: '#003b00', marginLeft: '10px' }}>[0% LOSS]</span>
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>PUDGY_ANALYTICS.EXE</h1>
        <p style={styles.subtitle}>Institutional Grade Indexing Dashboard</p>
      </header>

      <div style={styles.statsRow}>
      <div style={styles.statCard}>
        <p style={styles.statLabel}>MONTHLY_BURN_RATE</p>
        <p style={styles.statValue}>{monthlyBurnCount} <span style={styles.statUnit}>UNITS</span></p>
        <p style={styles.statSub}>Target: Mainnet_Activity</p>
      </div>

      <div style={{ flex: 1 }}></div>

      </div>

      <main style={styles.main}>

        {/* Rigth column: ANCESTORS */}
        <section style={{...styles.columnSection, minHeight: '600px'}}> {/* Forzamos altura mínima */}
          <h2 style={styles.sectionTitle}>[v] TOP_10_LOYAL_ANCESTORS</h2>

          <div style={styles.verticalList}>
            {loyal.length > 0 ? loyal.map(p => (
              <div key={p.id} style={styles.hackerRow}>
                <div style={styles.imageContainer}>
                  <img 
                    src={`https://api.pudgypenguins.io/pudgy/${p.id}/image`} 
                    style={styles.miniImage} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.parentElement?.querySelector('.img-fallback');
                      if (fb) (fb as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div className="img-fallback" style={styles.imageFallback}>
                    <span style={{fontSize: '8px'}}>OFFLINE</span>
                    <span style={{fontSize: '10px'}}>#{p.id}</span>
                  </div>
                </div>
                <div style={styles.rowInfo}>
                  <span style={styles.rowId}># {p.id}</span>
                  <span style={styles.rowOwner}>{p.currentOwner.slice(0,12)}...</span>
                </div>
                <span style={styles.statusTag}>LOYAL</span>
              </div>
            )) : (
              /* Fallback if empty list */
              <div style={{ color: '#003b00', padding: '20px', border: '1px solid #001a00' }}>
                &gt; WAITING_FOR_DATA_STREAM...
              </div>
            )}
          </div>
        </section>



        {/* Left column: EXPENSIVE */}
        <section style={{...styles.columnSection, borderLeft: '1px solid #003b00'}}>
          <h2 style={{...styles.sectionTitle, color: '#00ff41'}}>{"[>] LIVE_TRANSFER_ACTIVITY"}</h2>
          <div style={styles.verticalList}>
            {recentActivity.map((tx: any) => (
              <div key={tx.id} style={{...styles.hackerRow, borderColor: '#003b00'}}>
                <div style={styles.imageContainer}>
                  <img 
                    src={`https://api.pudgypenguins.io/pudgy/${tx.tokenId}/image`} 
                    style={styles.miniImage} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.parentElement?.querySelector('.img-fallback');
                      if (fb) (fb as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div className="img-fallback" style={styles.imageFallback}>
                    <span style={{fontSize: '8px'}}>OFFLINE</span>
                    <span style={{fontSize: '10px'}}>#{tx.tokenId}</span>
                  </div>
                </div>

                <div style={styles.rowInfo}>
                  <span style={{...styles.rowId, color: '#00ff41'}}>TOKEN_ID: #{tx.tokenId}</span>
                  <div style={{fontSize: '9px', color: '#008f11', marginTop: '4px'}}>
                    <span style={{color: '#aaa'}}>FROM:</span> {tx.from.slice(0,6)}...
                    <span style={{color: '#aaa', marginLeft: '5px'}}>TO:</span> {tx.to.slice(0,6)}
                  </div>
                </div>
                
                {/* Etiqueta de tipo de movimiento */}
                <span style={{
                  fontSize: '9px', 
                  color: tx.from === "0x0000000000000000000000000000000000000000" ? "#00ff41" : "#008f11",
                  border: '1px solid',
                  padding: '2px 4px'
                }}>
                  {tx.from === "0x0000000000000000000000000000000000000000" ? "MINT" : "TRANSFER"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Burned log */}
      <footer style={styles.footerLog}>
        <div style={styles.miniLogTitle}>[!] CRITICAL_SYSTEM_ALERTS (BURNS)</div>
        <div style={styles.horizontalBurnList}>
          {burned.length > 0 ? burned.map(p => (
          <span key={p.id} style={styles.burnAlert}>ALERT: PUDGY_#{p.id}_TERMINATED_AT_BLK_{p.lastUpdatedBlock}</span>
          )) : <span>&gt; NO_SYSTEM_DELETIONS_DETECTED</span>}
      </div>
      </footer>
    </div>
  );
}



const styles: any = {
  // Main Containers
  container: { 
    backgroundColor: '#000', 
    minHeight: '100vh', 
    width: '100vw', 
    padding: '60px 20px', 
    fontFamily: '"Courier New", monospace', 
    color: '#00ff41', 
    boxSizing: 'border-box', 
    overflowX: 'hidden' 
  },
  header: { textAlign: 'left', maxWidth: '1400px', margin: '0 auto 50px' },
  main: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    maxWidth: '1400px', 
    margin: '0 auto', 
    border: '1px solid #003b00' 
  },
  columnSection: { padding: '20px', backgroundColor: '#050505' },

  // Typography
  title: { fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '4px', textShadow: '0 0 15px rgba(0, 255, 65, 0.5)' },
  subtitle: { color: '#008f11', fontSize: '1rem', marginTop: '5px' },
  sectionTitle: { fontSize: '1rem', marginBottom: '25px', color: '#00ff41', fontWeight: 'bold' },

  // Stats Bar
  statsRow: { display: 'flex', gap: '20px', maxWidth: '1400px', margin: '0 auto 30px' },
  statCard: { backgroundColor: '#050505', padding: '20px', border: '1px solid #003b00', flex: 1 },
  statLabel: { fontSize: '11px', color: '#008f11', fontWeight: 'bold', letterSpacing: '2px' },
  statValue: { fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' },
  statUnit: { fontSize: '0.8rem', color: '#008f11' },

  // List Items (Hacker Rows)
  verticalList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  hackerRow: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '10px', 
    border: '1px solid #003b00', 
    backgroundColor: '#000', 
    gap: '15px' 
  },
  imageContainer: { 
    width: '50px', 
    height: '50px', 
    border: '1px solid #003b00', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  miniImage: { width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(100%) hue-rotate(80deg) brightness(80%)' },
  
  // Text Info & Tags
  rowInfo: { display: 'flex', flexDirection: 'column', flex: 1 },
  rowId: { fontSize: '14px', fontWeight: 'bold' },
  rowOwner: { fontSize: '10px', color: '#003b00' },
  statusTag: { fontSize: '10px', color: '#000', backgroundColor: '#00ff41', padding: '2px 6px', fontWeight: 'bold' },
  priceTag: { fontSize: '12px', color: '#ff0000', fontWeight: 'bold' },

  // Connection & Alerts
  liveBadge: { 
    position: 'absolute', top: '20px', left: '20px', border: '1px solid #00ff41', 
    padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', 
    backgroundColor: 'rgba(0, 255, 65, 0.1)' 
  },
  pulseDot: { width: '8px', height: '8px', backgroundColor: '#00ff41', borderRadius: '50%', boxShadow: '0 0 8px #00ff41' },
  footerLog: { 
    maxWidth: '1400px', margin: '20px auto', padding: '15px', 
    backgroundColor: '#050505', border: '1px solid #450a0a', color: '#ff0000', fontSize: '12px' 
  },
  burnAlert: { textTransform: 'uppercase', borderBottom: '1px dashed #450a0a', paddingBottom: '2px' }
};