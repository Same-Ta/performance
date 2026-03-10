"""
ProofWork On-Device Agent - 실행파일 빌드 스크립트

사용법:
    python build_exe.py

결과물:
    dist/ProofWorkAgent.exe
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

def main():
    print("=" * 60)
    print("  ProofWork Agent - 실행파일 빌드")
    print("=" * 60)
    print()
    
    # 1. PyInstaller 설치 확인
    print("[1/5] PyInstaller 확인 중...")
    try:
        import PyInstaller
        print(f"  ✓ PyInstaller {PyInstaller.__version__} 설치됨")
    except ImportError:
        print("  ✗ PyInstaller가 설치되지 않았습니다.")
        print("  설치 중: pip install pyinstaller")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("  ✓ PyInstaller 설치 완료")
    print()
    
    # 2. 이전 빌드 결과물 삭제
    print("[2/5] 이전 빌드 결과물 정리 중...")
    for dir_name in ["build", "dist"]:
        if Path(dir_name).exists():
            shutil.rmtree(dir_name)
            print(f"  ✓ {dir_name}/ 삭제됨")
    print()
    
    # 3. .spec 파일 존재 확인
    print("[3/5] 빌드 설정 확인 중...")
    spec_file = Path("agent.spec")
    if not spec_file.exists():
        print(f"  ✗ {spec_file} 파일이 없습니다.")
        print("  agent.spec 파일을 먼저 생성하세요.")
        sys.exit(1)
    print(f"  ✓ {spec_file} 확인됨")
    print()
    
    # 4. PyInstaller 실행
    print("[4/5] PyInstaller 실행 중...")
    print("  (빌드 시간: 약 2-5분 소요)")
    print()
    try:
        subprocess.check_call([
            sys.executable,
            "-m", "PyInstaller",
            str(spec_file),
            "--clean",
            "--noconfirm"
        ])
        print()
        print("  ✓ 빌드 완료")
    except subprocess.CalledProcessError as e:
        print(f"  ✗ 빌드 실패: {e}")
        sys.exit(1)
    print()
    
    # 5. 결과물 확인
    print("[5/5] 결과물 확인 중...")
    exe_path = Path("dist/ProofWorkAgent.exe")
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ {exe_path}")
        print(f"    크기: {size_mb:.1f} MB")
        print()
        print("=" * 60)
        print("  빌드 성공!")
        print("=" * 60)
        print()
        print("  실행 방법:")
        print(f"    {exe_path.absolute()}")
        print()
        print("  배포 방법:")
        print("    1. dist/ 폴더 전체를 압축")
        print("    2. GitHub Releases에 업로드")
        print("    3. 사용자가 다운로드 후 압축 해제 → .exe 실행")
        print()
    else:
        print(f"  ✗ {exe_path} 파일이 생성되지 않았습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()
