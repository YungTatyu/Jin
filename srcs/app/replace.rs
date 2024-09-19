use std::fs::{self, File};
use std::io::{self, prelude::*, Error};
use std::path::Path;

// 引数のfilenameを使って、内容をreadし、返す
fn contents_read(filename: &str) -> io::Result<String> {
    fs::read_to_string(filename)
}

// replace_pathのファイルから該当箇所を引数のprogram_idで置き換える
fn replace_content(program_id: &str, replace_path: &str) -> io::Result<()> {
    let replace_content = contents_read(replace_path)?;

    // 拡張子で置き換える方法を変えている rsとts, js
    let new_content = match Path::new(replace_path).extension().and_then(|s| s.to_str()) {
        Some("rs") => replace_content.replacen(
            "declare_id!(\"\")",
            &format!("declare_id!(\"{}\")", program_id),
            1,
        ),
        Some("js") | Some("ts") => replace_content.replacen(
            "const PROGRAM_ID = new PublicKey('');",
            &format!("const PROGRAM_ID = new PublicKey('{}');", program_id),
            1,
        ),
        _ => {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "Unsupported file extension",
            ))
        }
    };

    // tempファイルを生成する
    let temp_file_path = format!("{}.tmp", replace_path);

    // File::create() 関数を使用して、temp_file_path で指定されたパスに新しいファイルを作成します。
    // 作成されたファイルへの可変参照が temp_file に格納されます。
    let mut temp_file = File::create(&temp_file_path)?;

    // write_all() メソッドを使用して、new_content の内容をバイト列として temp_file に書き込みます。
    // as_bytes() メソッドは、文字列を UTF-8 エンコードされたバイト列に変換します。
    temp_file.write_all(new_content.as_bytes())?;

    // sync_all() メソッドは、ファイルシステムに対して、このファイルに関連するすべての保留中の書き込み操作を完了するよう指示します。
    // これにより、データが確実にディスクに書き込まれ、システムクラッシュなどの問題が発生した場合でもデータの整合性が保たれます。
    temp_file.sync_all()?;

    // 元のファイルを一時ファイルで置き換える
    fs::rename(&temp_file_path, replace_path)?;
    Ok(())
}

fn main() -> io::Result<()> {
    // コマンドライン引数の第一引数からStringのVecにargsに代入
    let args: Vec<String> = std::env::args().skip(1).collect();
    // argsが空だとエラー
    if args.is_empty() {
        eprintln!("Error: Command line arguments required");
        std::process::exit(1);
    }
    // 所有権の関係上、cloneでargs[0]の内容をコピー
    let replace_path = args[0].clone();

    // anchor_id.txtの内容を読み込み、contentに代入
    let program_id = contents_read("anchor_id.txt")?;

    // replace_pathのファイルにcontentの内容を置き換え
    replace_content(&program_id, replace_path.as_str())
}
