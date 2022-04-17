import express from 'express'
import getJejer from './fn/index.js'
const app = express()
const port = 3030

app.get('/seats', async (req, res) => {
    try{
        let jos = await getJejer('2022',req.query.bulan,req.query.tanggal,req.query.origin,req.query.destination,req.query.trainnumber,0,req.query.kelas)

        let text = `<b>${req.query.origin} - ${req.query.destination} || ${req.query.tanggal} - ${req.query.bulan} - '2022' || ${req.query.trainnumber} - ${req.query.kelas}</b><br/><br/>`

        jos.forEach((el)=>{
            let wagon = el.filter((x)=>{
                return x.some((y)=>{
                    return y !== ''
                })
            })[0].filter((x)=>{
                return x !== ''
            })[0].split('-')[0]

            text += `Gerbong : ${wagon}<br/>`

            el.forEach((x, index)=>{
                x.forEach((y, index2)=>{
                    if(y !== '' && index !== el.length -1){
                        text += `${y.split('-')[1]},`
                    } else if (y !== '' && index === el.length -1){
                        text += `${y.split('-')[1]}<br/><br/>`
                    } else if(index === el.length -1 && !x.some((op)=>op !== '') && index2 === x.length - 1){
                        text += `<br/><br/>`
                    }
                })
            })
        })
        res.set('Content-Type', 'text/html');
        res.send(text);                
    } catch (error){
        res.send(error)
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
