import express from 'express'
import getJejer from './fn/index.js'
const app = express()
const port = 3030

app.get('/kaligung', async (req, res) => {
    try{
        let jos = await getJejer('2022','4','16','SMC','WLR','205',0)

        let text = '<b>KALIGUNG SEMARANG - WELERI 16/4/2022 04:16</b><br/><br/>'

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
                x.forEach((y)=>{
                    if(y !== '' && index !== el.length -1){
                        text += `${y.split('-')[1]},`
                    } else if (y !== '' && index === el.length -1){
                        text += `${y.split('-')[1]}<br/><br/>`
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