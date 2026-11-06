//! Write `frontend/src/common/generated.ts` from the Rust socket contract.

fn main() {
    let path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../../frontend/src/common/generated.ts");
    let body = retrospected_server::export_typescript();
    if let Err(error) = std::fs::write(&path, body) {
        eprintln!("could not write {}: {error}", path.display());
        std::process::exit(1);
    }
}
