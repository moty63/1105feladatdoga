import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const {nev, kor} = req.query;
        let query = 'SELECT * FROM olvaso WHERE 1=1';
        const params = [];

        if (nev) {
            query += ' AND nev = ?';
            params.push(nev);
        }
        if(kor){
            query += ' AND kor = ?';
            params.push(kor);
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
    
});

router.get('/kolcsonzes/:id', async (req, res) => {
    const id = req.params.id;
    try{
        
        const query =`SELECT konyv.cim, konyv.szerzo, konyv.mufaj FROM kolcsonzes JOIN konyv ON konyv.id = kolcsonzes.konyv_id WHERE olvaso_id = ?`;
        const [rows] = await db.query(query, [id])
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
});

router.get('/atlag/:id', async (req, res) => {
    const id = req.params.id;
    try{
        
        const query =`SELECT AVG(ertekeles) as atlag_ertekeles FROM kolcsonzes JOIN konyv ON konyv.id = kolcsonzes.konyv_id WHERE olvaso_id = ? AND kolcsonzes.ertekeles > 0`;
        const [result] = await db.query(query, [id])
        res.json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
});

router.get('/atlagcsoportositva/:id', async (req, res) => {
    const id = req.params.id;
    try{
        
        const query =`SELECT AVG(ertekeles) as atlag_ertekeles, konyv.mufaj FROM kolcsonzes JOIN konyv ON konyv.id = kolcsonzes.konyv_id WHERE olvaso_id = ? GROUP BY konyv.mufaj;`;
        const [rows] = await db.query(query, [id])
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
})


router.post('/olvaso', async (req, res)=>{
    try{
        const {nev, kor} = req.body;
        if(!nev || !kor){
            return res.status(400).json({error: "a nev es a kor kotelezo"});
        }

        const query = `INSERT INTO olvaso (nev, tagsag_kezdete, kor) VALUES (?, CURRENT_DATE,?)`;

        const [result] = await db.query(query, [nev, tagsag_kezdete, kor]);
        res.status(201).json({message: "bravo kicsi", id: result.insertId})
        
    }catch(error){
        console.error(error)
        res.status(500).json({error:"szerver hiba"})
    }
});
    
router.post('/kolcsonzes', async (req, res)=>{
    try{
        const {konyv_id, olvaso_id, ertekeles, statusz} = req.body;
        if(!konyv_id || !olvaso_id ){
            return res.status(400).json({error: "a konyv es az olvaso id-ja kotelezo"});
        }

        const query = `INSERT INTO kolcsonzes (konyv_id, olvaso_id, ertekeles, statusz) VALUES (?, ?, ?, ?)`;

        const [result] = await db.query(query, [konyv_id, olvaso_id, ertekeles, statusz]);
        res.status(201).json({message: "bravo kicsi", id: result.insertId})
        
    }catch(error){
        console.error(error)
        res.status(500).json({error:"szerver hiba"})
    }
});



router.delete('/olvaso/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [olvasoCheck] = await db.query('SELECT id FROM olvaso WHERE id = ?', [id]);
        if (olvasoCheck.length === 0) {
            return res.status(404).json({ error: "nincs ilyen" });
        }

        await db.query('DELETE FROM olvaso WHERE id = ?', [id]);

        res.json({ message: "megsemmisitve" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hoba" });
    }
});


router.delete('/kolcsonzes/', async (req, res) => {
    try {
        const { konyv_id, olvaso_id, ertekeles, statusz } = req.body;


        if (!konyv_id || !olvaso_id || !ertekeles || !statusz) {
            return res.status(400).json({ error: "minden mezot meg kell" });
        }

        await db.query('DELETE FROM kolcsonzes WHERE (konyv_id, olvaso_id, ertekeles, statusz) VALUES (?, ?, ?, ?)', [konyv_id, olvaso_id, ertekeles, statusz]);

        res.json({ message: "megsemmisitve" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hoba" });
    }
});


router.get('/aktiv/', async (req, res) => {
    try{
        const {konyv_id, olvaso_id} = req.query;
        let query = 'SELECT * FROM kolcsonzes WHERE statusz = "aktiv"';
        const params = [];

        if (konyv_id) {
            query += ' AND konyv_id = ?';
            params.push(konyv_id);
        }
        if(olvaso_id){
            query += ' AND olvaso_id = ?';
            params.push(olvaso_id);
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
    
});


router.get('/legtobbet', async(req, res) => {
    try{
        let query = 'SELECT olvaso.id, olvaso.nev, COUNT(kolcsonzes.konyv_id) as kolcsonzesek_szama FROM olvaso JOIN kolcsonzes ON olvaso.id = kolcsonzes.olvaso_id  GROUP BY olvaso.id, olvaso.nev HAVING kolcsonzesek_szama = (SELECT MAX(cnt) FROM (SELECT COUNT(konyv.id) as cnt FROM kolcsonzes GROUP BY olvaso.id)';

        
        
        const [rows] = await db.query(query);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
    
});



router.put('/olvaso/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nev, kor} = req.body;

        const [olvasoCheck] = await db.query('SELECT id FROM olvaso WHERE id = ?', [id]);
        if (olvasoCheck.length === 0) {
            return res.status(404).json({ error: "nincs ilyen" });
        }

        const query = `
            UPDATE olvaso 
            SET nev = ?, kor = ? 
            WHERE id = ?
        `;

        await db.query(query, [nev, kor, id]);
        res.json({ message: "siker" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hiba" });
    }
});



router.put('/kolcsonzes/:id', async (req, res) => {
    try {
        const {ertekeles, statusz } = req.body;


        if ( !ertekeles || !statusz) {
            return res.status(400).json({ error: "minden mezot meg kell" });
        }

        res.json({ message: "megsemmisitve" });

        const query = `
            UPDATE kolcsonzes 
            SET ertekeles = ?, statusz = ? 
            WHERE id = ?
        `;

        await db.query(query, [nev, kor, id]);
        res.json({ message: "siker" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hiba" });
    }
});





export default router;
