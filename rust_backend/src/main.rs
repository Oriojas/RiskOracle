use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use log::info;

use rust_backend::handlers::{analysis_handler, chainlink_audit_handler, decode_handler};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init();

    let server_address = "127.0.0.1:8080";

    info!("🚀 Server starting on http://{}", server_address);

    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .route("/decode", web::post().to(decode_handler))
            .route("/analysis", web::post().to(analysis_handler))
            .route("/chainlink-audit", web::post().to(chainlink_audit_handler))
    })
    .bind(server_address)?
    .run()
    .await
}
