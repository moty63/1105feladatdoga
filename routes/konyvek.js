import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get('/', async(req, res) => {
    try{
        const {cim, szerzo, mufaj} = req.query;
        let query = 'SELECT * FROM konyv WHERE 1=1';
        const params = [];

        if (cim) {
            query += ' AND cim = ?';
            params.push(cim);
        }
        if(szerzo){
            query += ' AND szerzo = ?';
            params.push(szerzo);
        }
        if(mufaj){
            query += ' AND mufaj = ?';
            params.push(mufaj);
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).jaon({error: "szerver hiba"});
    }
    
});

router.post('/konyv', async (req, res)=>{
    try{
        const {cim, szerzo, mufaj} = req.body;
        if(!cim || !szerzo || !mufaj){
            return res.status(400).json({error: "a cim a szerzo es a mufaj megadasa kotelezo"});
        }

        const query = `INSERT INTO konyv (cim, szerzo, mufaj) VALUES (?, ?, ?)`;

        const [result] = await db.query(query, [cim, szerzo, mufaj]);
        res.status(201).json({message: "bravo kicsi", id: result.insertId})
        
    }catch(error){
        console.error(error)
        res.status(500).json({error:"szerver hiba"})
    }
});

router.delete('/konyv/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [konyvCheck] = await db.query('SELECT id FROM konyv WHERE id = ?', [id]);
        if (konyvCheck.length === 0) {
            return res.status(404).json({ error: "nincs ilyen" });
        }

        await db.query('DELETE FROM konyv WHERE id = ?', [id]);

        res.json({ message: "megsemmisitve" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hoba" });
    }
});

router.get('/atlagertekeles/:id', async (req, res) => {
    const id = req.params.id;
    try{
        
        const query =`SELECT AVG(kolcsonzes.ertekeles) as atlagos_ertekeles FROM konyv JOIN kolcsonzes ON kolcsonzes.konyv_id = konyv.id WHERE id = ? AND kolcsonzes.ertekeles > 0`;
        const [result] = await db.query(query, [id])
        res.json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
});

router.get('/atlagertekelesM/:mufaj', async (req, res) => {
    const mufaj = req.params.mufaj;
    try{
        
        const query =`SELECT AVG(kolcsonzes.ertekeles) as atlagos_ertekeles FROM konyv JOIN kolcsonzes ON kolcsonzes.konyv_id = konyv.id WHERE mufaj = ?`;
        const [result] = await db.query(query, [mufaj])
        res.json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "szerver hiba"});
    }
});

router.get('/legjobbak', async(req, res) => {
    try{
        const {cim, szerzo, mufaj} = req.query;
        let query = 'SELECT * FROM `konyv` JOIN kolcsonzes ON kolcsonzes.konyv_id = konyv.id WHERE kolcsonzes.ertekeles = 5';
        const params = [];

        if (cim) {
            query += ' AND cim = ?';
            params.push(cim);
        }
        if(szerzo){
            query += ' AND szerzo = ?';
            params.push(szerzo);
        }
        if(mufaj){
            query += ' AND mufaj = ?';
            params.push(mufaj);
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).jaon({error: "szerver hiba"});
    }
    
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cim, szerzo, mufaj} = req.body;

        const [konyvCheck] = await db.query('SELECT id FROM konyv WHERE id = ?', [id]);
        if (konyvCheck.length === 0) {
            return res.status(404).json({ error: "nincs ilyen" });
        }

        const query = `
            UPDATE konyv 
            SET cim = ?, szerzo = ?, mufaj = ? 
            WHERE id = ?
        `;

        await db.query(query, [cim, szerzo, mufaj, id]);
        res.json({ message: "siker" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "szerver hiba" });
    }
});


router.get('/hozzanemnyultak', async(req, res) => {
    try{
        let query = 'SELECT * FROM konyv WHERE id NOT IN (SELECT DISTINCT konyv_id FROM kolcsonzes)';

        const [rows] = await db.query(query);
        res.json(rows);
    }catch(error){
        console.error(error);
        res.status(500).jaon({error: "szerver hiba"});
    }
    
});



export default router;
