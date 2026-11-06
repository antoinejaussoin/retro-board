//! SQL against the schema produced by the TypeORM migrations.

mod account;
mod billing;
mod board;
mod content;
mod session;
mod settings;
mod users;

pub type DbResult<T> = Result<T, sqlx::Error>;

pub use account::*;
pub use billing::*;
pub use board::*;
pub use content::*;
pub use session::*;
pub use settings::*;
pub use users::*;
