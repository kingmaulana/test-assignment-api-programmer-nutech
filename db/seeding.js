const pool = require('./connection');
const fs = require('fs').promises;

async function seeding() {
    
    try {
        const readUser = JSON.parse(await fs.readFile('./data/user.json', 'utf-8')).map((el) => {
            return `('${el.first_name}', '${el.last_name}', '${el.email}', '${el.password}')`
        }).join(',\n');

        const readBanner = JSON.parse(await fs.readFile('./data/banner.json', 'utf-8')).map((el) => {
            return `('${el.banner_name}', '${el.banner_image}', '${el.description}')`
        }).join(',\n');

        const readService = JSON.parse(await fs.readFile('./data/services.json', 'utf-8')).map((el) => {
            return `('${el.service_code}', '${el.service_name}', '${el.service_icon}', ${el.service_tariff})`
        }
        ).join(',\n');
        
        const banner = `INSERT INTO "Banners" (banner_name, banner_image, description) VALUES ${readBanner};`
        const service = `INSERT INTO "Services" (service_code, service_name, service_icon, service_tariff) VALUES ${readService};`
        await pool.query(banner);
        await pool.query(service);
        console.log("🚀 ~ seeding ~ Seeding sukses")

    } catch (error) {
        console.log("🚀 ~ seeding ~ error:", error)
    }
}

seeding();